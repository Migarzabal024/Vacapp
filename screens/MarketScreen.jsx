import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator, Image,
  Modal, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const C = {
  bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854',
  muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8',
  red:'#E53935', orange:'#FF9800', cardBg:'#F5F7F5',
};

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };

const CATEGORIES = [
  { id:'all',          label:'Todas',        icon:'🐄' },
  { id:'Toros',        label:'Toros',        icon:'🐂' },
  { id:'Vacas',        label:'Vacas',        icon:'🐄' },
  { id:'Novillos',     label:'Novillos',     icon:'🥩' },
  { id:'Vaquillonas',  label:'Vaquillonas',  icon:'🌿' },
  { id:'Terneros',     label:'Terneros',     icon:'🐮' },
  { id:'Reproductores',label:'Reproductores',icon:'🏆' },
];

const DATE_FILTERS = [
  { id:'all', label:'Todas las fechas' },
  { id:'7',   label:'Ultimos 7 dias' },
  { id:'30',  label:'Ultimos 30 dias' },
  { id:'90',  label:'Ultimos 90 dias' },
];

const SORT_OPTIONS = [
  { id:'recent',    label:'Mas recientes' },
  { id:'price_asc', label:'Precio: menor a mayor' },
  { id:'price_desc',label:'Precio: mayor a menor' },
];

export default function MarketScreen({ navigation }) {
  const { user } = useAuth();

  const [publications, setPublications] = useState([]);
  const [topSellers,   setTopSellers]   = useState([]);
  const [stats,        setStats]        = useState({ total: 0, avgPrice: 0, totalSellers: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('all');
  const [dateFilter,   setDateFilter]   = useState('all');
  const [sortBy,       setSortBy]       = useState('recent');
  const [breed,        setBreed]        = useState('');
  const [location,     setLocation]     = useState('');
  const [showFilters,  setShowFilters]  = useState(false);
  const [availableBreeds,    setAvailableBreeds]    = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('publications')
        .select('*, profiles(full_name, rating, kyc_status)')
        .eq('status', 'active')
        .neq('user_id', user.id);

      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const from = new Date();
        from.setDate(from.getDate() - days);
        query = query.gte('created_at', from.toISOString());
      }
      if (category !== 'all') query = query.eq('category', category);
      if (breed)    query = query.ilike('breed',    `%${breed}%`);
      if (location) query = query.ilike('location', `%${location}%`);
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%,location.ilike.%${search}%`);
      }
      if (sortBy === 'recent')     query = query.order('created_at', { ascending: false });
      if (sortBy === 'price_asc')  query = query.order('price_ars',  { ascending: true });
      if (sortBy === 'price_desc') query = query.order('price_ars',  { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setPublications(data || []);

      const total    = data?.length || 0;
      const avgPrice = total > 0 ? Math.round(data.reduce((a, b) => a + (b.price_ars || 0), 0) / total) : 0;
      const sellers  = new Set(data?.map(p => p.user_id)).size;
      setStats({ total, avgPrice, totalSellers: sellers });

      setAvailableBreeds([...new Set(data?.map(p => p.breed).filter(Boolean))].slice(0, 20));
      setAvailableLocations([...new Set(data?.map(p => p.location?.split(',')[0]?.trim()).filter(Boolean))].slice(0, 20));

      const sellerMap = {};
      data?.forEach(p => {
        if (!sellerMap[p.user_id]) {
          sellerMap[p.user_id] = {
            id: p.user_id, name: p.profiles?.full_name || 'Vendedor',
            rating: p.profiles?.rating || 0, kyc: p.profiles?.kyc_status === 'verified', count: 0,
          };
        }
        sellerMap[p.user_id].count++;
      });
      setTopSellers(Object.values(sellerMap).sort((a, b) => b.count - a.count).slice(0, 5));

    } catch (e) {
      console.error('MarketScreen error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [category, dateFilter, sortBy]));

  const clearFilters = () => {
    setSearch(''); setCategory('all'); setDateFilter('all');
    setSortBy('recent'); setBreed(''); setLocation('');
    setShowFilters(false);
  };

  const activeFiltersCount = [
    category !== 'all', dateFilter !== 'all',
    sortBy !== 'recent', breed !== '', location !== '',
  ].filter(Boolean).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── PARTE FIJA (nunca se mueve) ── */}

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Marketplace</Text>
          <Text style={s.headerSub}>Compra y vende ganado</Text>
        </View>
        <TouchableOpacity style={s.filterIconBtn} onPress={() => setShowFilters(true)}>
          <Text style={s.filterIconTxt}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeTxt}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Buscar animal, raza, lugar..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchData}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchData(); }}>
              <Text style={{ color: C.muted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Carrusel categorias — FIJO */}
      <View style={s.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id}
              style={[s.catChip, category === cat.id && s.catChipActive]}
              onPress={() => setCategory(cat.id)}>
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={[s.catLabel, category === cat.id && s.catLabelActive]} numberOfLines={1}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Carrusel ordenamiento — FIJO */}
      <View style={s.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.id}
              style={[s.sortChip, sortBy === opt.id && s.sortChipActive]}
              onPress={() => setSortBy(opt.id)}>
              <Text style={[s.sortLabel, sortBy === opt.id && s.sortLabelActive]} numberOfLines={1}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── PARTE SCROLLEABLE ── */}

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando marketplace...</Text>
        </View>
      ) : (
        <ScrollView style={s.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statNum}>{stats.total}</Text>
              <Text style={s.statLabel}>Publicaciones</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statNum}>$ {stats.avgPrice > 0 ? (stats.avgPrice / 1000).toFixed(0) + 'k' : '—'}</Text>
              <Text style={s.statLabel}>Precio prom.</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statNum}>{stats.totalSellers}</Text>
              <Text style={s.statLabel}>Vendedores</Text>
            </View>
          </View>

          {/* Mejores vendedores */}
          {topSellers.length > 0 && (
            <>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>🏆 Mejores Vendedores</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 16 }}>
                {topSellers.map((seller, i) => (
                  <View key={seller.id} style={s.sellerCard}>
                    <View style={s.sellerAvatar}>
                      <Text style={s.sellerAvatarTxt}>{seller.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    {i === 0 && <View style={s.topBadge}><Text style={s.topBadgeTxt}>👑</Text></View>}
                    <Text style={s.sellerName} numberOfLines={1}>{seller.name}</Text>
                    <Text style={s.sellerCount}>{seller.count} animales</Text>
                    {seller.rating > 0 && <Text style={s.sellerRating}>⭐ {seller.rating}</Text>}
                    {seller.kyc && <Text style={s.sellerKyc}>🛡️ KYC</Text>}
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Contador */}
          <View style={s.resultsHeader}>
            <Text style={s.resultsCount}>{publications.length} publicaciones</Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={s.clearFilters}>Limpiar filtros ✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grid 2 columnas */}
          {publications.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🐄</Text>
              <Text style={s.emptyTitle}>Sin resultados</Text>
              <Text style={s.emptySub}>Proba con otros filtros o busca por otra raza</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={clearFilters}>
                <Text style={s.emptyBtnTxt}>Ver todas las publicaciones</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.grid}>
              {publications.map(item => {
                const emoji = EMOJI[item.category] || '🐄';
                const dias  = Math.floor((Date.now() - new Date(item.created_at)) / 86400000);
                const fechaLabel = dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} dias`;
                return (
                  <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.9}
                    onPress={() => navigation.navigate('PublicationDetail', { item })}>
                    <View style={s.cardImg}>
                      {item.photo_url
                        ? <Image source={{ uri: item.photo_url }} style={s.cardPhoto} resizeMode="cover" />
                        : <Text style={s.cardEmoji}>{emoji}</Text>
                      }
                      {item.badge && (
                        <View style={s.cardBadge}><Text style={s.cardBadgeTxt}>⭐ {item.badge}</Text></View>
                      )}
                      {item.kyc_verified && (
                        <View style={s.kycBadge}><Text style={{ fontSize: 12 }}>🛡️</Text></View>
                      )}
                      <View style={s.dateBadge}>
                        <Text style={s.dateBadgeTxt}>{fechaLabel}</Text>
                      </View>
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.cardBreed} numberOfLines={1}>{item.breed}</Text>
                      <Text style={s.cardCategory}>{item.category}</Text>
                      <Text style={s.cardLoc} numberOfLines={1}>📍 {item.location}</Text>
                      <Text style={s.cardMeta}>{item.weight_kg} kg · {item.age_months} m</Text>
                      <Text style={s.cardPrice}>$ {item.price_ars?.toLocaleString('es-AR')}</Text>
                      <TouchableOpacity style={s.buyBtn}
                        onPress={() => navigation.navigate('PublicationDetail', { item })}>
                        <Text style={s.buyBtnTxt}>Ver →</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal filtros */}
      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={m.overlay}>
          <View style={m.modal}>
            <View style={m.modalHeader}>
              <Text style={m.modalTitle}>Filtros avanzados</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={m.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={m.sectionLabel}>Fecha de publicacion</Text>
              <View style={m.optionsRow}>
                {DATE_FILTERS.map(df => (
                  <TouchableOpacity key={df.id}
                    style={[m.optionChip, dateFilter === df.id && m.optionChipActive]}
                    onPress={() => setDateFilter(df.id)}>
                    <Text style={[m.optionTxt, dateFilter === df.id && m.optionTxtActive]}>{df.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={m.sectionLabel}>Ordenar por precio</Text>
              <View style={m.optionsRow}>
                {SORT_OPTIONS.slice(1).map(opt => (
                  <TouchableOpacity key={opt.id}
                    style={[m.optionChip, sortBy === opt.id && m.optionChipActive]}
                    onPress={() => setSortBy(opt.id)}>
                    <Text style={[m.optionTxt, sortBy === opt.id && m.optionTxtActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={m.sectionLabel}>Raza</Text>
              <View style={m.inputWrap}>
                <TextInput style={m.input} placeholder="Ej: Hereford, Angus..." placeholderTextColor="#AAA" value={breed} onChangeText={setBreed} />
              </View>
              {availableBreeds.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
                  {availableBreeds.map(b => (
                    <TouchableOpacity key={b} style={[m.optionChip, breed === b && m.optionChipActive]} onPress={() => setBreed(breed === b ? '' : b)}>
                      <Text style={[m.optionTxt, breed === b && m.optionTxtActive]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <Text style={m.sectionLabel}>Ubicacion</Text>
              <View style={m.inputWrap}>
                <TextInput style={m.input} placeholder="Ej: Cordoba, Buenos Aires..." placeholderTextColor="#AAA" value={location} onChangeText={setLocation} />
              </View>
              {availableLocations.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
                  {availableLocations.map(l => (
                    <TouchableOpacity key={l} style={[m.optionChip, location === l && m.optionChipActive]} onPress={() => setLocation(location === l ? '' : l)}>
                      <Text style={[m.optionTxt, location === l && m.optionTxtActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </ScrollView>
            <View style={m.actions}>
              <TouchableOpacity style={m.clearBtn} onPress={clearFilters}>
                <Text style={m.clearBtnTxt}>Limpiar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={m.applyBtn} onPress={() => { setShowFilters(false); fetchData(); }}>
                <Text style={m.applyBtnTxt}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.cardBg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  headerTitle:    { fontSize: 22, fontWeight: '700', color: C.white },
  headerSub:      { fontSize: 12, color: C.muted, marginTop: 2 },
  filterIconBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterIconTxt:  { fontSize: 20 },
  filterBadge:    { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  filterBadgeTxt: { fontSize: 10, color: C.white, fontWeight: '700' },
  searchRow:      { backgroundColor: C.bg, paddingHorizontal: 16, paddingBottom: 12 },
  searchBar:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 14, height: 42, gap: 10 },
  searchIcon:     { fontSize: 16 },
  searchInput:    { flex: 1, color: C.white, fontSize: 14 },
  catContainer:   { height: 64, backgroundColor: C.cardBg },
  catRow:         { paddingHorizontal: 16, gap: 10, alignItems: 'center', height: 64 },
  catChip:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 40, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: '#CCC' },
  catChipActive:  { backgroundColor: C.bg, borderColor: C.green },
  catIcon:        { fontSize: 15 },
  catLabel:       { fontSize: 13, color: C.dark, fontWeight: '600' },
  catLabelActive: { color: C.white },
  sortContainer:  { height: 48, backgroundColor: C.cardBg },
  sortRow:        { paddingHorizontal: 16, gap: 10, alignItems: 'center', height: 48 },
  sortChip:       { paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: C.white, borderWidth: 1.5, borderColor: '#CCC', justifyContent: 'center' },
  sortChipActive: { backgroundColor: C.green, borderColor: C.green },
  sortLabel:      { fontSize: 12, color: C.dark, fontWeight: '500' },
  sortLabelActive:{ color: C.white, fontWeight: '700' },
  loadingWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:     { fontSize: 14, color: C.gray },
  scrollArea:     { flex: 1 },
  scroll:         { paddingBottom: 100 },
  statsRow:       { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  statCard:       { flex: 1, backgroundColor: C.white, borderRadius: 12, padding: 12, alignItems: 'center', elevation: 1 },
  statNum:        { fontSize: 16, fontWeight: '700', color: C.dark },
  statLabel:      { fontSize: 10, color: C.gray, marginTop: 2 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: C.dark },
  sellerCard:     { width: 110, backgroundColor: C.white, borderRadius: 14, padding: 12, alignItems: 'center', elevation: 2, position: 'relative' },
  sellerAvatar:   { width: 48, height: 48, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sellerAvatarTxt:{ fontSize: 20, fontWeight: '700', color: C.white },
  topBadge:       { position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center' },
  topBadgeTxt:    { fontSize: 12 },
  sellerName:     { fontSize: 12, fontWeight: '700', color: C.dark, textAlign: 'center' },
  sellerCount:    { fontSize: 11, color: C.green, marginTop: 2 },
  sellerRating:   { fontSize: 11, color: C.orange, marginTop: 2 },
  sellerKyc:      { fontSize: 10, color: C.green, marginTop: 2 },
  resultsHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  resultsCount:   { fontSize: 13, color: C.gray },
  clearFilters:   { fontSize: 13, color: C.red, fontWeight: '500' },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  card:           { width: CARD_W, backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  cardImg:        { height: 130, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardPhoto:      { width: '100%', height: '100%' },
  cardEmoji:      { fontSize: 52 },
  cardBadge:      { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  cardBadgeTxt:   { color: '#FFD700', fontSize: 9, fontWeight: '700' },
  kycBadge:       { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  dateBadge:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 8, paddingVertical: 3 },
  dateBadgeTxt:   { color: 'rgba(255,255,255,0.9)', fontSize: 10 },
  cardInfo:       { padding: 10 },
  cardName:       { fontSize: 13, fontWeight: '700', color: C.dark },
  cardBreed:      { fontSize: 11, color: C.gray, marginTop: 1 },
  cardCategory:   { fontSize: 10, color: C.green, fontWeight: '600', marginTop: 2 },
  cardLoc:        { fontSize: 10, color: C.gray, marginTop: 3 },
  cardMeta:       { fontSize: 10, color: C.gray, marginTop: 2 },
  cardPrice:      { fontSize: 13, fontWeight: '700', color: C.green, marginTop: 6 },
  buyBtn:         { backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', marginTop: 6 },
  buyBtnTxt:      { color: C.white, fontSize: 12, fontWeight: '700' },
  emptyWrap:      { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon:      { fontSize: 56, marginBottom: 12 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: C.dark, marginBottom: 6 },
  emptySub:       { fontSize: 14, color: C.gray, textAlign: 'center', marginBottom: 20 },
  emptyBtn:       { backgroundColor: C.green, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnTxt:    { color: C.white, fontSize: 14, fontWeight: '700' },
});

const m = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:          { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:     { fontSize: 18, fontWeight: '700', color: C.dark },
  closeBtn:       { fontSize: 20, color: C.gray, padding: 4 },
  sectionLabel:   { fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 10, marginTop: 16 },
  optionsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.white },
  optionChipActive:{ backgroundColor: C.bg, borderColor: C.bg },
  optionTxt:      { fontSize: 13, color: C.dark },
  optionTxtActive:{ color: C.white, fontWeight: '600' },
  inputWrap:      { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 46, justifyContent: 'center', marginBottom: 4 },
  input:          { fontSize: 14, color: C.dark },
  actions:        { flexDirection: 'row', gap: 12, marginTop: 20 },
  clearBtn:       { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  clearBtnTxt:    { fontSize: 14, color: C.gray, fontWeight: '500' },
  applyBtn:       { flex: 2, height: 48, borderRadius: 12, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  applyBtnTxt:    { fontSize: 14, color: C.white, fontWeight: '700' },
});