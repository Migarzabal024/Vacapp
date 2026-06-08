// src/screens/PublicarScreen.tsx
// VMG-55 · Validar datos ingresados en el formulario de publicación
// Sprint 2 — Desarrollo Inicial · VacaApp / BoviMatch
//
// NOTAS PARA EL EQUIPO:
//   · Este formulario requiere KYC aprobado — verificar useAuth().user.estado_kyc
//   · El endpoint POST /api/publicaciones lo implementa VMG-32 (otro miembro)
//   · Las validaciones del backend están en validate.js (rules.publicacion + rules.publicacionGenetica)
//   · El formato de proyeccion_genetica está definido en utils/genetica.ts (VMG-52)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants';
import { usePublicacionForm, RAZAS_DISPONIBLES } from '../hooks/usePublicacionForm';
import type { FormPublicacion } from '../hooks/usePublicacionForm';
import { useAuth } from '../context/AuthContext';

// ── Componente: campo del formulario ─────────────────────────────────────────
interface CampoProps {
  label:       string;
  valor:       string;
  onChange:    (v: string) => void;
  onBlur?:     () => void;
  error?:      string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?:  boolean;
  opcional?:   boolean;
  ayuda?:      string;
}

function Campo({
  label, valor, onChange, onBlur, error,
  placeholder, keyboardType = 'default',
  multiline = false, opcional = false, ayuda,
}: CampoProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.campoWrap}>
      <View style={styles.campoLabelRow}>
        <Text style={styles.campoLabel}>{label}</Text>
        {opcional && <Text style={styles.campoOpcional}>Opcional</Text>}
      </View>
      {ayuda && <Text style={styles.campoAyuda}>{ayuda}</Text>}
      <TextInput
        style={[
          styles.campoInput,
          multiline && styles.campoInputMulti,
          focused && styles.campoInputFocused,
          error  && styles.campoInputError,
        ]}
        value={valor}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorTxt}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ── Componente: selector de raza ──────────────────────────────────────────────
function SelectorRaza({
  valor, onSelect, error,
}: { valor: string; onSelect: (r: string) => void; error?: string }) {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.campoWrap}>
      <Text style={styles.campoLabel}>Raza</Text>
      <TouchableOpacity
        style={[styles.campoInput, styles.selectorBtn, error && styles.campoInputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={valor ? styles.selectorValor : styles.selectorPlaceholder}>
          {valor || 'Seleccioná la raza'}
        </Text>
        <Text style={{ color: COLORS.textSecondary }}>▾</Text>
      </TouchableOpacity>
      {error && (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorTxt}>{error}</Text>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccioná la raza</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 20, color: COLORS.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {RAZAS_DISPONIBLES.map(raza => (
                <TouchableOpacity
                  key={raza}
                  style={[styles.razaOpcion, valor === raza && styles.razaOpcionActiva]}
                  onPress={() => { onSelect(raza); setModalVisible(false); }}
                >
                  <Text style={[styles.razaOpcionTxt, valor === raza && { color: COLORS.primary, fontWeight: '700' }]}>
                    {raza}
                  </Text>
                  {valor === raza && <Text style={{ color: COLORS.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export function PublicarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user }   = useAuth();

  // Handler de envío — conecta con el endpoint de VMG-32
  async function handleSubmit(payload: FormPublicacion) {
    // TODO VMG-32: reemplazar con llamada real al endpoint
    // const res = await publicacionesService.crear(payload);
    await new Promise(r => setTimeout(r, 1500)); // simulación
    console.log('[PublicarScreen] payload validado:', payload);
  }

  const {
    form, setCampo, marcarTocado, errorVisible,
    enviando, exito, errorApi,
    formularioValido, enviar, resetear,
  } = usePublicacionForm(handleSubmit);

  // Bloquear si KYC no está aprobado
  if (user?.estado_kyc !== 'aprobado') {
    return (
      <View style={styles.bloqueadoWrap}>
        <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar animal</Text>
        </LinearGradient>
        <View style={styles.bloqueadoBody}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={styles.bloqueadoTitulo}>Verificación requerida</Text>
          <Text style={styles.bloqueadoMsg}>
            Necesitás tener el KYC aprobado para publicar animales en VacApp.
          </Text>
          <TouchableOpacity
            style={styles.btnPrimario}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnPrimarioTxt}>Completar verificación</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pantalla de éxito
  if (exito) {
    return (
      <View style={styles.exitoWrap}>
        <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={{ paddingTop: 56, paddingBottom: 20 }}>
          <Text style={styles.exitoIcono}>✅</Text>
        </LinearGradient>
        <View style={styles.exitoBody}>
          <Text style={styles.exitoTitulo}>¡Publicación enviada!</Text>
          <Text style={styles.exitoMsg}>
            Tu animal fue publicado correctamente en el catálogo de VacApp.
          </Text>
          <TouchableOpacity style={styles.btnPrimario} onPress={resetear}>
            <Text style={styles.btnPrimarioTxt}>Publicar otro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecundario} onPress={() => navigation.goBack()}>
            <Text style={styles.btnSecundarioTxt}>Volver al catálogo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicar animal</Text>
        <View style={styles.kycChip}>
          <Text style={styles.kycChipTxt}>✅ KYC</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sección: datos básicos */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📋 Datos del animal</Text>

          <Campo
            label="Título del anuncio"
            valor={form.titulo}
            onChange={v => setCampo('titulo', v)}
            onBlur={() => marcarTocado('titulo')}
            error={errorVisible('titulo')}
            placeholder="Ej: Toro Aberdeen Angus de élite"
          />

          <SelectorRaza
            valor={form.raza}
            onSelect={v => setCampo('raza', v)}
            error={errorVisible('raza')}
          />

          <View style={styles.rowDos}>
            <View style={{ flex: 1 }}>
              <Campo
                label="Precio (ARS)"
                valor={form.precio}
                onChange={v => setCampo('precio', v)}
                onBlur={() => marcarTocado('precio')}
                error={errorVisible('precio')}
                placeholder="850000"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Campo
                label="Edad (meses)"
                valor={form.edad_meses}
                onChange={v => setCampo('edad_meses', v)}
                onBlur={() => marcarTocado('edad_meses')}
                error={errorVisible('edad_meses')}
                placeholder="18"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Sección: historial reproductivo */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🐄 Historial Reproductivo</Text>
          <Campo
            label="Historial"
            valor={form.historial_reproductivo}
            onChange={v => setCampo('historial_reproductivo', v)}
            onBlur={() => marcarTocado('historial_reproductivo')}
            error={errorVisible('historial_reproductivo')}
            placeholder="Ej: Sin servicio previo / 2 partos normales"
            multiline
            opcional
          />
          <Text style={styles.charCount}>
            {form.historial_reproductivo.length}/1000
          </Text>
        </View>

        {/* Sección: proyección genética */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🧬 Proyección Genética</Text>
          <Campo
            label="Indicadores DEP / EBV"
            valor={form.proyeccion_genetica}
            onChange={v => setCampo('proyeccion_genetica', v)}
            onBlur={() => marcarTocado('proyeccion_genetica')}
            error={errorVisible('proyeccion_genetica')}
            placeholder="DEP Peso destete: +28 | DEP Terneza: +0.8"
            multiline
            opcional
            ayuda='Formato: "DEP Nombre: +valor | EBV Nombre: +valor"'
          />

          {/* Ejemplos clickeables */}
          <Text style={styles.ejemplosTitulo}>Ejemplos rápidos:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {[
              'DEP Peso destete: +28 | DEP Terneza: +0.8',
              'EBV Ganancia: +58 | EBV Área bife: +1.2',
              'DEP Leche: +180 | DEP Fertilidad: +12',
            ].map((ej, i) => (
              <TouchableOpacity
                key={i}
                style={styles.ejemploChip}
                onPress={() => setCampo('proyeccion_genetica', ej)}
              >
                <Text style={styles.ejemploTxt} numberOfLines={1}>{ej}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Error de API */}
        {errorApi && (
          <View style={styles.errorApiBox}>
            <Text style={styles.errorApiTxt}>❌ {errorApi}</Text>
          </View>
        )}

        {/* Indicador de completitud */}
        <View style={styles.completitudWrap}>
          <View style={styles.completitudBar}>
            <View style={[
              styles.completitudFill,
              {
                width: `${calcularCompletitud(form)}%`,
                backgroundColor: formularioValido ? COLORS.primary : COLORS.warning,
              },
            ]} />
          </View>
          <Text style={styles.completitudTxt}>
            {formularioValido ? '✅ Formulario completo' : `${calcularCompletitud(form)}% completado`}
          </Text>
        </View>

        {/* Botón enviar */}
        <TouchableOpacity
          onPress={enviar}
          disabled={enviando}
          activeOpacity={0.88}
          style={{ marginBottom: 32 }}
        >
          <LinearGradient
            colors={formularioValido ? ['#4EBA2E', '#1E3D2B'] : ['#b0c4b0', '#8a9e8a']}
            style={styles.btnEnviar}
          >
            {enviando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnEnviarTxt}>
                  {formularioValido ? '🐄 Publicar animal' : 'Completá los campos requeridos'}
                </Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Calcula porcentaje de completitud del formulario
function calcularCompletitud(form: FormPublicacion): number {
  const requeridos: (keyof FormPublicacion)[] = ['titulo', 'raza', 'precio', 'edad_meses'];
  const opcionales: (keyof FormPublicacion)[] = ['historial_reproductivo', 'proyeccion_genetica'];
  const totalReq = requeridos.filter(c => form[c].trim() !== '').length;
  const totalOpc = opcionales.filter(c => form[c].trim() !== '').length;
  return Math.round(((totalReq / requeridos.length) * 70) + ((totalOpc / opcionales.length) * 30));
}

const styles = StyleSheet.create({
  header:           { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  kycChip:          { backgroundColor: 'rgba(78,186,46,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  kycChipTxt:       { color: '#4EBA2E', fontSize: 11, fontWeight: '700' },
  scrollContent:    { padding: 16, paddingBottom: 40 },
  seccion:          { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12 },
  seccionTitulo:    { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  campoWrap:        { marginBottom: 12 },
  campoLabelRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  campoLabel:       { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  campoOpcional:    { fontSize: 11, color: COLORS.textSecondary, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  campoAyuda:       { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6, lineHeight: 16 },
  campoInput:       { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: '#fafafa' },
  campoInputMulti:  { minHeight: 80, paddingTop: 12 },
  campoInputFocused:{ borderColor: COLORS.primary, backgroundColor: '#fff' },
  campoInputError:  { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  errorRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorIcon:        { color: '#ef4444', fontSize: 12 },
  errorTxt:         { color: '#ef4444', fontSize: 12, flex: 1 },
  rowDos:           { flexDirection: 'row', gap: 10 },
  charCount:        { fontSize: 11, color: COLORS.textSecondary, textAlign: 'right', marginTop: -8 },
  selectorBtn:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorValor:    { fontSize: 14, color: COLORS.textPrimary },
  selectorPlaceholder:{ fontSize: 14, color: COLORS.textSecondary },
  ejemplosTitulo:   { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6 },
  ejemploChip:      { backgroundColor: '#e0f2fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, maxWidth: 240 },
  ejemploTxt:       { fontSize: 11, color: '#0369a1' },
  completitudWrap:  { marginBottom: 16 },
  completitudBar:   { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  completitudFill:  { height: '100%', borderRadius: 3 },
  completitudTxt:   { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  btnEnviar:        { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnEnviarTxt:     { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorApiBox:      { backgroundColor: '#fee2e2', padding: 12, borderRadius: 12, marginBottom: 12 },
  errorApiTxt:      { color: '#b91c1c', fontSize: 13 },
  // Modal raza
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:       { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  razaOpcion:       { paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between' },
  razaOpcionActiva: { backgroundColor: '#f0fdf4' },
  razaOpcionTxt:    { fontSize: 15, color: COLORS.textPrimary },
  // Pantalla bloqueada
  bloqueadoWrap:    { flex: 1, backgroundColor: COLORS.bg },
  bloqueadoBody:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  bloqueadoTitulo:  { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  bloqueadoMsg:     { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  // Pantalla éxito
  exitoWrap:        { flex: 1, backgroundColor: COLORS.bg },
  exitoIcono:       { fontSize: 56, textAlign: 'center' },
  exitoBody:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  exitoTitulo:      { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  exitoMsg:         { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  btnPrimario:      { width: '100%', padding: 16, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center' },
  btnPrimarioTxt:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSecundario:    { width: '100%', padding: 16, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, alignItems: 'center' },
  btnSecundarioTxt: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
});
