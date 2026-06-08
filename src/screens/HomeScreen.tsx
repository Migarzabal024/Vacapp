// src/screens/HomeScreen.tsx
// VMG-47 · Filtros básicos para publicaciones
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, CATEGORIAS, RANK_COLORS } from '../constants';
import type { CategoriaAnimal, GeneticRank } from '../types';
import { useMarketplace } from '../hooks/useMarketplace';
import { ORDEN_LABELS } from '../services/api/marketplaceService';
import type { OrdenPublicacion } from '../services/api/marketplaceService';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 12) / 2;

function formatPrice(n: number) {
  return '$' + n.toLocaleString('es-AR');
}

// Mapeo provisional de raza → GeneticRank para mantener los badges del mock
function getRank(raza: string): GeneticRank {
  const mapa: Record<string, GeneticRank> = {
    'Limousin': 'Élite Internacional',
    'Aberdeen Angus': 'Elite',
    'Brangus': 'Elite',
    'Hereford': 'Superior',
    'Braford': 'Premium',
  };
  return mapa[raza] || 'Premium';
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    publicaciones, filtros, setFiltro, limpiarFiltros,
    cargando, error, usandoMock, paginacion, siguientePagina,
  } = useMarketplace();

  const [modalVisible, setModalVisible] = useState(false);
  // Estados locales del modal (se aplican al cerrar)
  const [tempPrecioMin, setTempPrecioMin] = useState('');
  const [tempPrecioMax, setTempPrecioMax] = useState('');
  const [tempEdadMin, setTempEdadMin]     = useState('');
  const [tempEdadMax, setTempEdadMax]     = useState('');
  const [tempOrden, setTempOrden]         = useState<OrdenPublicacion>('reciente');

  const hayFiltrosActivos =
    filtros.raza || filtros.precio_min || filtros.precio_max ||
    filtros.edad_min || filtros.edad_max || (filtros.orden && filtros.orden !== 'reciente');

  function aplicarFiltros() {
    if (tempPrecioMin) setFiltro('precio_min', parseFloat(tempPrecioMin));
    else setFiltro('precio_min', undefined);
    if (tempPrecioMax) setFiltro('precio_max', parseFloat(tempPrecioMax));
    else setFiltro('precio_max', undefined);
    if (tempEdadMin) setFiltro('edad_min', parseInt(tempEdadMin));
    else setFiltro('edad_min', undefined);
    if (tempEdadMax) setFiltro('edad_max', parseInt(tempEdadMax));
    else setFiltro('edad_max', undefined);
    setFiltro('orden', tempOrden);
    setModalVisible(false);
  }

  function abrirModal() {
    setTempPrecioMin(filtros.precio_min?.toString() || '');
    setTempPrecioMax(filtros.precio_max?.toString() || '');
    setTempEdadMin(filtros.edad_min?.toString()     || '');
    setTempEdadMax(filtros.edad_max?.toString()     || '');
    setTempOrden(filtros.orden || 'reciente');
    setModalVisible(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Bienvenido,</Text>
            <Text style={styles.username}>VacApp 🐄</Text>
          </View>
          <View style={styles.avatar}><Text style={{ fontSize: 22 }}>🐄</Text></View>
        </View>

        {/* Barra búsqueda + botón filtros */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar raza, animal..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={filtros.search || ''}
              onChangeText={v => setFiltro('search', v)}
            />
            {filtros.search ? (
              <TouchableOpacity onPress={() => setFiltro('search', '')}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Botón filtros */}
          <TouchableOpacity
            style={[styles.filterBtn, hayFiltrosActivos && styles.filterBtnActive]}
            onPress={abrirModal}
          >
            <Text style={{ fontSize: 16 }}>⚙️</Text>
            {hayFiltrosActivos && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 16 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setFiltro('categoria', cat.key)}
              style={[styles.catBtn, filtros.categoria === cat.key && styles.catBtnActive]}
            >
              <Text>{cat.emoji}</Text>
              <Text style={[styles.catTxt, filtros.categoria === cat.key && { color: '#fff', fontWeight: '600' }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chips de filtros activos */}
        {hayFiltrosActivos && (
          <View style={styles.chipsRow}>
            {filtros.precio_min && (
              <View style={styles.chip}>
                <Text style={styles.chipTxt}>Precio min: {formatPrice(filtros.precio_min)}</Text>
              </View>
            )}
            {filtros.precio_max && (
              <View style={styles.chip}>
                <Text style={styles.chipTxt}>Precio max: {formatPrice(filtros.precio_max)}</Text>
              </View>
            )}
            {filtros.edad_min && (
              <View style={styles.chip}>
                <Text style={styles.chipTxt}>Edad min: {filtros.edad_min} m</Text>
              </View>
            )}
            {filtros.edad_max && (
              <View style={styles.chip}>
                <Text style={styles.chipTxt}>Edad max: {filtros.edad_max} m</Text>
              </View>
            )}
            {filtros.orden && filtros.orden !== 'reciente' && (
              <View style={styles.chip}>
                <Text style={styles.chipTxt}>{ORDEN_LABELS[filtros.orden]}</Text>
              </View>
            )}
            <TouchableOpacity onPress={limpiarFiltros} style={[styles.chip, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.chipTxt, { color: '#b91c1c' }]}>✕ Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contador + indicador mock */}
        <View style={styles.countRow}>
          <Text style={styles.sectionTitle}>
            {cargando ? 'Cargando...' : `${paginacion?.total ?? publicaciones.length} publicaciones`}
          </Text>
          {usandoMock && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockTxt}>modo demo</Text>
            </View>
          )}
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
        )}

        {/* Loading */}
        {cargando && (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        )}

        {/* Grid de publicaciones */}
        {!cargando && (
          <View style={styles.grid}>
            {publicaciones.map(p => {
              const rank = getRank(p.raza);
              return (
                <TouchableOpacity
                  key={p.id_publicacion}
                  onPress={() => navigation.navigate('AnimalDetail', { id: String(p.id_publicacion) })}
                  activeOpacity={0.9}
                  style={[styles.card, { width: CARD_W }]}
                >
                  <View style={[styles.cardImgWrap, { backgroundColor: COLORS.primaryDark }]}>
                    <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[rank] }]}>
                      <Text style={styles.rankTxt}>{rank}</Text>
                    </View>
                    <View style={styles.cardNameWrap}>
                      <Text style={styles.cardName} numberOfLines={1}>{p.titulo}</Text>
                      <Text style={styles.cardBreed} numberOfLines={1}>{p.raza}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardMeta}>
                      {p.vendedor_kyc === 'aprobado' ? '✅' : '⚠️'} {p.vendedor_nombre}
                    </Text>
                    <Text style={styles.cardMeta}>{p.edad_meses} meses</Text>
                    <Text style={styles.cardPrice}>{formatPrice(p.precio)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Cargar más */}
        {paginacion?.hay_mas && !cargando && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={siguientePagina}>
            <Text style={styles.loadMoreTxt}>Cargar más</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal de filtros avanzados */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros avanzados</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 20, color: COLORS.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Precio */}
              <Text style={styles.filterLabel}>Precio (ARS)</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Mínimo"
                  keyboardType="numeric"
                  value={tempPrecioMin}
                  onChangeText={setTempPrecioMin}
                  placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.rangeSep}>—</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Máximo"
                  keyboardType="numeric"
                  value={tempPrecioMax}
                  onChangeText={setTempPrecioMax}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              {/* Edad */}
              <Text style={styles.filterLabel}>Edad (meses)</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Mínimo"
                  keyboardType="numeric"
                  value={tempEdadMin}
                  onChangeText={setTempEdadMin}
                  placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.rangeSep}>—</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Máximo"
                  keyboardType="numeric"
                  value={tempEdadMax}
                  onChangeText={setTempEdadMax}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              {/* Orden */}
              <Text style={styles.filterLabel}>Ordenar por</Text>
              <View style={styles.ordenGrid}>
                {(Object.keys(ORDEN_LABELS) as OrdenPublicacion[]).map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.ordenBtn, tempOrden === key && styles.ordenBtnActive]}
                    onPress={() => setTempOrden(key)}
                  >
                    <Text style={[styles.ordenTxt, tempOrden === key && { color: '#fff' }]}>
                      {ORDEN_LABELS[key]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Botones acción */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnSecundario}
                onPress={() => {
                  setTempPrecioMin(''); setTempPrecioMax('');
                  setTempEdadMin('');   setTempEdadMax('');
                  setTempOrden('reciente');
                  limpiarFiltros();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.btnSecundarioTxt}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimario} onPress={aplicarFiltros}>
                <Text style={styles.btnPrimarioTxt}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome:      { color: COLORS.olive, fontSize: 12 },
  username:     { color: '#fff', fontSize: 20, fontWeight: '700' },
  avatar:       { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  searchRow:    { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchWrap:   { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchInput:  { flex: 1, color: '#fff', fontSize: 14 },
  filterBtn:    { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterDot:    { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  catBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20 },
  catBtnActive: { backgroundColor: COLORS.primaryDark },
  catTxt:       { fontSize: 13, color: COLORS.textSecondary },
  chipsRow:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  chip:         { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipTxt:      { fontSize: 11, color: '#0369a1', fontWeight: '500' },
  countRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  mockBadge:    { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  mockTxt:      { fontSize: 10, color: '#92400e', fontWeight: '600' },
  errorBox:     { margin: 16, padding: 12, backgroundColor: '#fee2e2', borderRadius: 10 },
  errorTxt:     { color: '#b91c1c', fontSize: 13 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  card:         { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  cardImgWrap:  { height: 120, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  rankBadge:    { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rankTxt:      { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardNameWrap: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  cardName:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  cardBreed:    { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  cardBody:     { padding: 10, gap: 3 },
  cardMeta:     { fontSize: 10, color: COLORS.textSecondary },
  cardPrice:    { fontWeight: '700', fontSize: 14, color: COLORS.textPrimary, marginTop: 4 },
  loadMoreBtn:  { margin: 16, padding: 14, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  loadMoreTxt:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  filterLabel:  { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 16 },
  rangeRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeInput:   { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.textPrimary },
  rangeSep:     { color: COLORS.textSecondary, fontWeight: '600' },
  ordenGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ordenBtn:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  ordenBtnActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  ordenTxt:     { fontSize: 13, color: COLORS.textSecondary },
  modalFooter:  { flexDirection: 'row', gap: 10, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  btnSecundario:{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  btnSecundarioTxt: { color: COLORS.textSecondary, fontWeight: '600' },
  btnPrimario:  { flex: 2, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  btnPrimarioTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
