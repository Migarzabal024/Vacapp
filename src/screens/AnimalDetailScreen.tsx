// src/screens/AnimalDetailScreen.tsx
// VMG-52 · Registrar y validar información genética de los animales
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, RANK_COLORS, ANIMALS_MOCK } from '../constants';
import {
  parsearProyeccion,
  INDICADORES_CONOCIDOS,
} from '../utils/genetica';
import type { IndicadorGenetico } from '../utils/genetica';

type Props = NativeStackScreenProps<RootStackParamList, 'AnimalDetail'>;

function formatPrice(n: number) { return '$' + n.toLocaleString('es-AR'); }

// ── Componente: tarjeta de un indicador genético ──────────────────────────────
function IndicadorCard({ ind }: { ind: IndicadorGenetico }) {
  const info = INDICADORES_CONOCIDOS[ind.nombre];
  return (
    <View style={[
      styles.indicadorCard,
      { borderLeftColor: ind.positivo ? COLORS.primary : '#ef4444' },
    ]}>
      <View style={styles.indicadorHeader}>
        <Text style={styles.indicadorIcono}>{info?.icono ?? '📊'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.indicadorEtiqueta}>{ind.etiqueta}</Text>
          {info && <Text style={styles.indicadorDesc}>{info.descripcion}</Text>}
        </View>
        <View style={[
          styles.indicadorValorWrap,
          { backgroundColor: ind.positivo ? '#dcfce7' : '#fee2e2' },
        ]}>
          <Text style={[
            styles.indicadorValor,
            { color: ind.positivo ? '#15803d' : '#b91c1c' },
          ]}>
            {ind.positivo ? '+' : ''}{ind.valor}
            {info?.unidad ? ` ${info.unidad}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Componente: sección genética completa ─────────────────────────────────────
function SeccionGenetica({ rawProyeccion }: { rawProyeccion: string | null }) {
  const proyeccion = parsearProyeccion(rawProyeccion);

  if (!proyeccion.valida) {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🧬 Proyección Genética</Text>
        <Text style={styles.infoBodyMuted}>Sin datos genéticos disponibles</Text>
      </View>
    );
  }

  const deps = proyeccion.indicadores.filter(i => i.sistema === 'DEP');
  const ebvs = proyeccion.indicadores.filter(i => i.sistema === 'EBV');

  return (
    <View style={styles.infoCard}>
      <View style={styles.geneticaHeader}>
        <Text style={styles.infoTitle}>🧬 Proyección Genética</Text>
        <View style={styles.sistemaBadgesRow}>
          {deps.length > 0 && (
            <View style={[styles.sistemaBadge, { backgroundColor: '#e0f2fe' }]}>
              <Text style={[styles.sistemaBadgeTxt, { color: '#0369a1' }]}>DEP</Text>
            </View>
          )}
          {ebvs.length > 0 && (
            <View style={[styles.sistemaBadge, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[styles.sistemaBadgeTxt, { color: '#15803d' }]}>EBV</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.geneticaSubtitle}>
        {proyeccion.indicadores.length} indicador{proyeccion.indicadores.length !== 1 ? 'es' : ''} registrado{proyeccion.indicadores.length !== 1 ? 's' : ''}
      </Text>

      {proyeccion.indicadores.map((ind, i) => (
        <IndicadorCard key={i} ind={ind} />
      ))}

      {/* Errores de parseo (si los hay) */}
      {proyeccion.errores.length > 0 && (
        <View style={styles.geneticaErrorBox}>
          <Text style={styles.geneticaErrorTxt}>
            ⚠️ {proyeccion.errores.join(' · ')}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export function AnimalDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route      = useRoute<Props['route']>();
  const animal     = ANIMALS_MOCK.find(a => a.id === route.params.id);
  const [liked,     setLiked]     = useState(false);
  const [reserved,  setReserved]  = useState(false);
  const [reserving, setReserving] = useState(false);

  if (!animal) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 56 }}>🐄</Text>
      <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.primaryDark }}>Animal no encontrado</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: COLORS.primary }}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );

  const handleReserve = async () => {
    setReserving(true);
    await new Promise(r => setTimeout(r, 1500));
    setReserving(false);
    setReserved(true);
  };

  const rankColor = (RANK_COLORS as any)[animal.geneticRank] ?? COLORS.primaryDark;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: animal.image }} style={StyleSheet.absoluteFillObject as any} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(10,30,22,0.85)']}
            style={StyleSheet.absoluteFillObject as any}
          />
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBtn}>
              <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.heroBtn}>
              <Text style={{ fontSize: 18 }}>{liked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroBottom}>
            <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
              <Text style={styles.rankTxt}>{animal.geneticRank}</Text>
            </View>
            <Text style={styles.heroName}>{animal.name}</Text>
            <Text style={styles.heroBreed}>{animal.breed}</Text>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Precio de venta</Text>
            <Text style={styles.price}>{formatPrice(animal.price)}</Text>
          </View>
          <View style={styles.locationChip}>
            <Text style={{ fontSize: 12, color: COLORS.primaryDark }}>📍 {animal.province}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {([
            ['📅', 'Edad',  `${animal.age} m`],
            ['⚖️', 'Peso',  `${animal.weight} kg`],
            ['📊', 'Rango', animal.geneticRank],
          ] as const).map(([icon, lbl, val]) => (
            <View key={lbl} style={styles.statCard}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {animal.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagTxt}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* ── Sección genética estructurada (VMG-52) ── */}
        <SeccionGenetica rawProyeccion={animal.geneticProjection} />

        {/* Historial reproductivo */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🐄 Historial Reproductivo</Text>
          <Text style={styles.infoBody}>{animal.reproductiveHistory}</Text>
        </View>

        {/* Vendedor */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>👤 Vendedor</Text>
          <View style={styles.vendedorRow}>
            <View style={styles.vendedorAvatar}>
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendedorNombre}>{animal.seller}</Text>
              <Text style={styles.vendedorMeta}>
                ⭐ {animal.sellerRating}
                {animal.sellerVerified ? '  ✅ KYC verificado' : '  ⚠️ Sin verificar'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.likeBtn}>
          <Text style={{ fontSize: 22 }}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReserve}
          disabled={reserving || reserved}
          style={{ flex: 1 }}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={reserved ? ['#1E3D2B', '#1E3D2B'] : ['#4EBA2E', '#1E3D2B']}
            style={styles.reserveBtn}
          >
            {reserving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.reserveTxt}>
                  {reserved ? '✓ Reserva confirmada' : '📱 Reservar ahora'}
                </Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:             { height: 280, position: 'relative' },
  heroTop:          { position: 'absolute', top: 56, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  heroBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroBottom:       { position: 'absolute', bottom: 16, left: 16, right: 16 },
  rankBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 6 },
  rankTxt:          { color: '#fff', fontSize: 10, fontWeight: '700' },
  heroName:         { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroBreed:        { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  priceCard:        { margin: 16, marginTop: -20, backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4 },
  priceLabel:       { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  price:            { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  locationChip:     { backgroundColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statsRow:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  statCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 4 },
  statVal:          { fontWeight: '700', fontSize: 12, color: COLORS.textPrimary, textAlign: 'center' },
  statLbl:          { fontSize: 10, color: COLORS.textSecondary },
  tagsRow:          { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tag:              { backgroundColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagTxt:           { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark },
  infoCard:         { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  infoTitle:        { fontWeight: '700', fontSize: 14, color: COLORS.textPrimary, marginBottom: 8 },
  infoBody:         { fontSize: 13, color: COLORS.primaryDark, lineHeight: 20 },
  infoBodyMuted:    { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' },
  // Genética
  geneticaHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sistemaBadgesRow: { flexDirection: 'row', gap: 6 },
  sistemaBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sistemaBadgeTxt:  { fontSize: 10, fontWeight: '700' },
  geneticaSubtitle: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 10 },
  indicadorCard:    { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 8, paddingVertical: 4 },
  indicadorHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  indicadorIcono:   { fontSize: 18 },
  indicadorEtiqueta:{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  indicadorDesc:    { fontSize: 11, color: COLORS.textSecondary },
  indicadorValorWrap:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  indicadorValor:   { fontSize: 13, fontWeight: '700' },
  geneticaErrorBox: { marginTop: 8, backgroundColor: '#fef3c7', padding: 8, borderRadius: 8 },
  geneticaErrorTxt: { fontSize: 11, color: '#92400e' },
  // Vendedor
  vendedorRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vendedorAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  vendedorNombre:   { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  vendedorMeta:     { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  // Bottom CTA
  bottomCta:        { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  likeBtn:          { width: 56, height: 56, borderRadius: 18, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  reserveBtn:       { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reserveTxt:       { color: '#fff', fontWeight: '600', fontSize: 15 },
});
