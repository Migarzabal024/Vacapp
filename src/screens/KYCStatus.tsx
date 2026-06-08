/**
 * KYCStatus.tsx
 * VMG-58 · Mostrar estados de validación de KYC al usuario
 * Asignado a: Emanuel Gonzalo Feijoo
 * Sprint 2 — Desarrollo Inicial · VacaApp / BoviMatch
 *
 * CAMBIOS v2 (post VMG-61, VMG-47, VMG-55):
 *   - Convertido de .jsx a .tsx con tipos completos
 *   - Conectado a kycService.getStatus() — ya no requiere props manuales
 *   - Muestra documentos faltantes reales desde la API (faltantes[])
 *   - Usa TIPO_DOCUMENTO_LABELS de kycService para labels en español
 *   - Botón "aprobado" navega a Publicar (VMG-55)
 *   - Modo offline: si la API falla, acepta props como fallback
 *   - comentario_auditoria tipado en DocumentoKyc (types/index.ts)
 *
 * USO conectado a la API (recomendado):
 *   <KYCStatus />
 *
 * USO con props manuales (fallback / tests):
 *   <KYCStatus statusOverride="rechazado" comentario="Falta DNI dorso" />
 *
 * INTEGRACIÓN:
 *   · kycService.getStatus()  → GET /api/kyc/status      (VMG-61 · EF)
 *   · comentario_auditoria    → campo DOCUMENTOS_KYC     (VMG-57 · otro miembro)
 *   · onReintentarPress       → pantalla carga docs       (VMG-60 · otro miembro)
 *   · navigation 'Publicar'   → PublicarScreen            (VMG-55 · EF)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { kycService, TIPO_DOCUMENTO_LABELS } from '../services/api/kycService';
import type { KycStatusResponse } from '../services/api/kycService';
import { useAuth } from '../context/AuthContext';
import type { KycEstado, TipoDocumentoKyc, DocumentoKyc } from '../types';

// ─── PALETA ───────────────────────────────────────────────────────────────────
interface EstadoColors {
  bg: string; border: string; text: string; icon: string;
}

const C = {
  bg:            '#0D1F0F',
  surface:       '#142A16',
  border:        '#1E3D21',
  accent:        '#4CAF50',
  accentDim:     '#2E7D32',
  textPrimary:   '#E8F5E9',
  textSecondary: '#81C784',
  textMuted:     '#4A7C50',
  no_verificado: { bg: '#1A1A2E', border: '#5C6BC0', text: '#9FA8DA', icon: '#7986CB' } as EstadoColors,
  pendiente:     { bg: '#1A2E0A', border: '#8BC34A', text: '#AED581', icon: '#CDDC39' } as EstadoColors,
  aprobado:      { bg: '#0A2E1A', border: '#4CAF50', text: '#81C784', icon: '#66BB6A' } as EstadoColors,
  rechazado:     { bg: '#2E0A0A', border: '#EF5350', text: '#EF9A9A', icon: '#F44336' } as EstadoColors,
  bloqueado:     { bg: '#2E1A0A', border: '#FF9800', text: '#FFCC80', icon: '#FFA726' } as EstadoColors,
};

// ─── CONFIG DE ESTADOS ────────────────────────────────────────────────────────
interface KycConfig {
  emoji:   string;
  badge:   string;
  titulo:  string;
  mensaje: string;
  accion:  string | null;
  colors:  EstadoColors;
}

const KYC_CONFIG: Record<KycEstado, KycConfig> = {
  no_verificado: {
    emoji: '📋', badge: 'SIN VERIFICAR',
    titulo:  'Verificación pendiente',
    mensaje: 'Todavía no cargaste tu documentación. Completá el KYC para operar en la plataforma.',
    accion:  'Cargar documentación',
    colors:  C.no_verificado,
  },
  pendiente: {
    emoji: '🔍', badge: 'EN REVISIÓN',
    titulo:  'En revisión',
    mensaje: 'Tu documentación fue recibida y está siendo revisada. Te notificaremos cuando tengamos novedades.',
    accion:  null,
    colors:  C.pendiente,
  },
  aprobado: {
    emoji: '✅', badge: 'VERIFICADO',
    titulo:  'Identidad verificada',
    mensaje: 'Tu KYC fue aprobado. Podés publicar ganado, explorar el catálogo y realizar operaciones de compraventa.',
    accion:  'Ir a publicar',
    colors:  C.aprobado,
  },
  rechazado: {
    emoji: '❌', badge: 'RECHAZADO',
    titulo:  'Documentación rechazada',
    mensaje: 'Hubo un problema con tu documentación. Revisá el motivo y volvé a intentarlo.',
    accion:  'Reintentar verificación',
    colors:  C.rechazado,
  },
  bloqueado: {
    emoji: '🔒', badge: 'BLOQUEADO',
    titulo:  'Cuenta bloqueada',
    mensaje: 'Tu cuenta fue bloqueada por el administrador. Si creés que es un error, contactá a soporte.',
    accion:  'Contactar soporte',
    colors:  C.bloqueado,
  },
};

const PASOS_KYC: string[]                  = ['Registro', 'Docs subidas', 'En revisión', 'Verificado'];
const PASO_INDEX: Record<KycEstado, number> = {
  no_verificado: 0, pendiente: 2, aprobado: 3, rechazado: 1, bloqueado: 1,
};

// ─── TIPOS DE PROPS ───────────────────────────────────────────────────────────
interface KYCStatusProps {
  /** Override manual del estado — para tests o modo offline */
  statusOverride?:      KycEstado;
  /** Comentario del admin — fallback si la API no devuelve el dato */
  comentario?:          string;
  /** Navegar a pantalla de carga de documentos (VMG-60) */
  onReintentarPress?:   () => void;
  /** Contactar soporte */
  onSoportePress?:      () => void;
  /** Nombre del usuario — fallback si useAuth no lo tiene */
  nombreUsuario?:       string;
}

// ─── HOOK: animaciones ────────────────────────────────────────────────────────
function useKYCAnimation(status: KycEstado) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    if (status === 'pendiente') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status]);

  return { fadeAnim, slideAnim, pulseAnim };
}

// ─── SUB-COMPONENTE: barra de progreso ────────────────────────────────────────
function KYCProgressBar({ status }: { status: KycEstado }) {
  const pasoActual = PASO_INDEX[status] ?? 0;
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Tu progreso KYC</Text>
      <View style={styles.progressTrack}>
        {PASOS_KYC.map((paso, i) => {
          const activo   = i <= pasoActual;
          const esActual = i === pasoActual;
          const esError  = (status === 'rechazado' || status === 'bloqueado') && esActual;
          const color    = esError ? C.rechazado.icon : activo ? C.accent : C.border;
          return (
            <React.Fragment key={paso}>
              <View style={styles.pasoKYC}>
                <View style={[styles.pasoCircle, { backgroundColor: color, borderColor: color }]}>
                  <Text style={styles.pasoCircleText}>
                    {esError ? '✕' : activo ? '✓' : String(i + 1)}
                  </Text>
                </View>
                <Text style={[styles.pasoLabel, { color: activo ? C.textSecondary : C.textMuted }]}>
                  {paso}
                </Text>
              </View>
              {i < PASOS_KYC.length - 1 && (
                <View style={[styles.pasoLinea, { backgroundColor: i < pasoActual ? C.accent : C.border }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function KYCStatus({
  statusOverride,
  comentario: comentarioProp,
  onReintentarPress,
  onSoportePress,
  nombreUsuario: nombreProp,
}: KYCStatusProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user }   = useAuth();

  const [apiData,  setApiData]  = useState<KycStatusResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<boolean>(false);

  const cargarEstado = useCallback(async () => {
    setCargando(true);
    setErrorApi(false);
    try {
      const res = await kycService.getStatus();
      setApiData(res.data);
    } catch {
      setErrorApi(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarEstado(); }, [cargarEstado]);

  // Resolver valores: API > prop override > contexto de auth
  const status: KycEstado =
    statusOverride ??
    apiData?.estado_kyc ??
    user?.estado_kyc ??
    'no_verificado';

  const faltantes: TipoDocumentoKyc[] = apiData?.faltantes ?? [];
  const nombreUsuario = nombreProp ?? user?.nombre_completo?.split(' ')[0];

  // Comentario del doc rechazado más reciente
  const comentario: string | undefined =
    comentarioProp ??
    apiData?.documentos?.find(
      (d: DocumentoKyc) => d.estado_auditoria === 'rechazado'
    )?.comentario_auditoria ?? undefined;

  const config                         = KYC_CONFIG[status] ?? KYC_CONFIG.no_verificado;
  const { fadeAnim, slideAnim, pulseAnim } = useKYCAnimation(status);
  const c: EstadoColors                = config.colors;

  const handleAccion = (): void => {
    if (status === 'no_verificado' || status === 'rechazado') {
      onReintentarPress?.();
    } else if (status === 'bloqueado') {
      onSoportePress?.();
    } else if (status === 'aprobado') {
      navigation.navigate('Publicar');
    }
  };

  if (cargando) {
    return (
      <View style={[styles.scroll, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={[styles.mensaje, { marginTop: 16 }]}>Verificando estado KYC...</Text>
      </View>
    );
  }

  // Fallback de documentos: usa API si hay datos, sino lista completa hardcodeada
  const DOCS_FALLBACK: TipoDocumentoKyc[] = ['dni_frente', 'dni_dorso', 'constancia_cuit', 'titulo'];
  const docsFaltantes: TipoDocumentoKyc[] = faltantes.length > 0 ? faltantes : DOCS_FALLBACK;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {errorApi && (
        <TouchableOpacity style={styles.recargarBtn} onPress={cargarEstado}>
          <Text style={styles.recargarTxt}>↻  Reintentar conexión</Text>
        </TouchableOpacity>
      )}

      <Animated.View style={[
        styles.card,
        {
          backgroundColor: c.bg,
          borderColor:     c.border,
          opacity:         fadeAnim,
          transform:       [{ translateY: slideAnim }],
        },
      ]}>
        {/* Badge */}
        <View style={[styles.badge, { borderColor: c.border }]}>
          <View style={[styles.badgeDot, { backgroundColor: c.icon }]} />
          <Text style={[styles.badgeText, { color: c.text }]}>{config.badge}</Text>
        </View>

        {/* Ícono animado */}
        <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}>
          {config.emoji}
        </Animated.Text>

        {/* Título */}
        <Text style={[styles.titulo, { color: c.text }]}>
          {nombreUsuario ? `${nombreUsuario}, ` : ''}{config.titulo}
        </Text>

        {/* Mensaje */}
        <Text style={styles.mensaje}>{config.mensaje}</Text>

        {/* Comentario del admin */}
        {comentario && (status === 'rechazado' || status === 'bloqueado') && (
          <View style={[styles.comentarioBox, { borderLeftColor: c.border }]}>
            <Text style={styles.comentarioLabel}>Motivo del administrador:</Text>
            <Text style={[styles.comentarioTexto, { color: c.text }]}>"{comentario}"</Text>
          </View>
        )}

        {/* Documentos faltantes (no_verificado) */}
        {status === 'no_verificado' && (
          <View style={styles.pasosContainer}>
            <Text style={styles.pasosTitle}>
              {faltantes.length > 0
                ? `Documentos faltantes (${faltantes.length}):`
                : 'Para verificarte necesitás:'}
            </Text>
            {docsFaltantes.map((tipo, i) => (
              <View key={tipo} style={styles.pasoRow}>
                <View style={[styles.pasoNum, { backgroundColor: C.accentDim }]}>
                  <Text style={styles.pasoNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.pasoTexto}>{TIPO_DOCUMENTO_LABELS[tipo]}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Docs rechazados con detalle */}
        {status === 'rechazado' &&
          apiData?.documentos?.some((d: DocumentoKyc) => d.estado_auditoria === 'rechazado') && (
          <View style={styles.pasosContainer}>
            <Text style={styles.pasosTitle}>Documentos a corregir:</Text>
            {apiData.documentos
              .filter((d: DocumentoKyc) => d.estado_auditoria === 'rechazado')
              .map((doc: DocumentoKyc) => (
                <View key={doc.id_documento} style={styles.pasoRow}>
                  <View style={[styles.pasoNum, { backgroundColor: C.rechazado.icon }]}>
                    <Text style={styles.pasoNumText}>✕</Text>
                  </View>
                  <Text style={styles.pasoTexto}>
                    {TIPO_DOCUMENTO_LABELS[doc.tipo_documento]}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Botón de acción */}
        {config.accion && (
          <TouchableOpacity
            style={[styles.boton, { backgroundColor: c.icon }]}
            onPress={handleAccion}
            activeOpacity={0.82}
          >
            <Text style={styles.botonTexto}>{config.accion}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <KYCProgressBar status={status} />
    </ScrollView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll:            { flex: 1, backgroundColor: C.bg },
  container:         { padding: 20, paddingBottom: 40 },
  recargarBtn:       { alignSelf: 'center', marginBottom: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  recargarTxt:       { color: C.textSecondary, fontSize: 13 },
  card:              { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 20 },
  badge:             { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 20, gap: 6 },
  badgeDot:          { width: 6, height: 6, borderRadius: 3 },
  badgeText:         { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  emoji:             { fontSize: 52, marginBottom: 14 },
  titulo:            { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10, letterSpacing: 0.3 },
  mensaje:           { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  comentarioBox:     { width: '100%', borderLeftWidth: 3, paddingLeft: 12, marginBottom: 16, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 },
  comentarioLabel:   { fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  comentarioTexto:   { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  pasosContainer:    { width: '100%', marginBottom: 20 },
  pasosTitle:        { fontSize: 12, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  pasoRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  pasoNum:           { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pasoNumText:       { color: C.textPrimary, fontSize: 11, fontWeight: '700' },
  pasoTexto:         { color: C.textSecondary, fontSize: 14 },
  boton:             { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  botonTexto:        { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  progressContainer: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20 },
  progressTitle:     { fontSize: 12, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },
  progressTrack:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  pasoKYC:           { alignItems: 'center', flex: 0, width: 56 },
  pasoCircle:        { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  pasoCircleText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  pasoLabel:         { fontSize: 10, textAlign: 'center', lineHeight: 13 },
  pasoLinea:         { flex: 1, height: 2, marginTop: 13, borderRadius: 1 },
});
