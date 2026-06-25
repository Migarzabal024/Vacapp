import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8' };

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };

export default function ExploreScreen({ navigation }) {
  const [search,     setSearch]     = useState('');
  const [breeds,     setBreeds]     = useState([]);
  const [provinces,  setProvinces]  = useState([]);
  const [recent,     setRecent]     = useState([]);
  const [verified,   setVerified]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searching,  setSearching]  = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Traer publicaciones activas
      const { data: pubs } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!pubs) return;

      // Calcular razas con conteo
      const breedMap = {};
      pubs.forEach(p => {
        if (!breedMap[p.breed]) breedMap[p.breed] = { name: p.breed, count: 0, category: p.category };
        breedMap[p.breed].count++;
      });
      setBreeds(Object.values(breedMap).sort((a,b) => b.count - a.count).slice(0, 6));

      // Calcular provincias con conteo
      const provMap = {};
      pubs.forEach(p => {
        const prov = p.province || p.location?.split(',')[0]?.trim() || 'Sin provincia';
        if (!provMap[prov]) provMap[prov] = { name: prov, count: 0 };
        provMap[prov].count++;
      });
      setProvinces(Object.values(provMap).sort((a,b) => b.count - a.count).slice(0, 6));

      // Publicaciones recientes (ultimas 4)
      setRecent(pubs.slice(0, 4));

      // Vendedores verificados KYC
      const { data: verifiedPubs } = await supabase
        .from('publications')
        .select('*, profiles(full_name, rating, kyc_status)')
        .eq('status', 'active')
        .eq('kyc_verified', true)
        .limit(3);
      setVerified(verifiedPubs || []);

    } catch (e) {
      console.error('Error en ExploreScreen:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleSearch = async () => {
    if (!search.trim()) { setSearching(false); setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${search}%,breed.ilike.%${search}%,location.ilike.%${search}%,category.ilike.%${search}%`);
      setSearchResults(data || []);
    } catch (e) {
      console.error('Error buscando:', e.message);
    }
  };

  const clearSearch = () => { setSearch(''); setSearching(false); setSearchResults([]); };

  const filterByBreed = async (breedName) => {
    setSearch(breedName);
    setSearching(true);
    const { data } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'active')
      .eq('breed', breedName);
    setSearchResults(data || []);
  };

  const filterByProvince = async (provinceName) => {
    setSearch(provinceName);
    setSearching(true);
    const { data } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'active')
      .ilike('location', `%${provinceName}%`);
    setSearchResults(data || []);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

      <View style={s.header}>
        <Text style={s.title}>Explorar</Text>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por raza, ubicacion..."
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={{ color: '#AAA', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando...</Text>
        </View>
      ) : searching ? (
        // Resultados de busqueda
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.resultsTitle}>{searchResults.length} resultados para "{search}"</Text>
          {searchResults.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>Sin resultados</Text>
              <Text style={s.emptySub}>Proba con otra raza, ubicacion o nombre</Text>
            </View>
          ) : (
            <View style={s.resultsGrid}>
              {searchResults.map(item => (
                <TouchableOpacity key={item.id} style={s.resultCard} activeOpacity={0.9}
                  onPress={() => navigation.navigate('PublicationDetail', { item })}>
                  <View style={s.resultImg}>
                    {item.photo_url
                      ? <Image source={{ uri: item.photo_url }} style={s.resultPhoto} resizeMode="cover" />
                      : <Text style={s.resultEmoji}>{EMOJI[item.category] || '🐄'}</Text>
                    }
                    {item.kyc_verified && (
                      <View style={s.kycBadge}><Text style={{ fontSize: 14 }}>🛡️</Text></View>
                    )}
                  </View>
                  <View style={s.resultInfo}>
                    <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.resultBreed}>{item.breed}</Text>
                    <Text style={s.resultLoc}>📍 {item.location}</Text>
                    <Text style={s.resultPrice}>$ {item.price_ars?.toLocaleString('es-AR')}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        // Vista normal
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Por Raza */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Explorar por Raza</Text>
            <Text style={s.verTodos}>{breeds.reduce((a,b) => a + b.count, 0)} animales</Text>
          </View>
          {breeds.length === 0 ? (
            <Text style={s.emptySection}>Sin razas disponibles aun</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal:16, gap:12, marginBottom:20 }}>
              {breeds.map((b, i) => (
                <TouchableOpacity key={i} style={s.breedCard} onPress={() => filterByBreed(b.name)}>
                  <Text style={s.breedEmoji}>{EMOJI[b.category] || '🐄'}</Text>
                  <Text style={s.breedName}>{b.name}</Text>
                  <Text style={s.breedCount}>{b.count} animales</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Por Provincia */}
          <Text style={[s.sectionTitle, { paddingHorizontal:16, marginBottom:12 }]}>Por Provincia</Text>
          {provinces.length === 0 ? (
            <Text style={s.emptySection}>Sin datos de provincias aun</Text>
          ) : (
            <View style={s.provinceList}>
              {provinces.map((p, i) => (
                <TouchableOpacity key={i} style={s.provinceRow} onPress={() => filterByProvince(p.name)}>
                  <View style={s.provinceLeft}>
                    <View style={s.provinceIcon}><Text>📍</Text></View>
                    <View>
                      <Text style={s.provinceName}>{p.name}</Text>
                      <Text style={s.provinceCount}>{p.count} publicaciones</Text>
                    </View>
                  </View>
                  <Text style={s.provinceArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Vendedores KYC Verificados */}
          {verified.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { paddingHorizontal:16, marginBottom:12, marginTop:20 }]}>Vendedores Verificados</Text>
              <View style={s.verifiedList}>
                {verified.map((v, i) => (
                  <TouchableOpacity key={i} style={s.verifiedRow}
                    onPress={() => navigation.navigate('PublicationDetail', { item: v })}>
                    <View style={s.verifiedIcon}><Text style={s.verifiedCheck}>✅</Text></View>
                    <View style={s.verifiedInfo}>
                      <Text style={s.verifiedName}>{v.name}</Text>
                      <Text style={s.verifiedRating}>{v.breed} · {v.location}</Text>
                    </View>
                    <Text style={s.verifiedArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Publicaciones Recientes */}
          <View style={[s.sectionHeader, { marginTop:20 }]}>
            <Text style={s.sectionTitle}>Publicaciones Recientes</Text>
            <TouchableOpacity><Text style={s.verTodos}>Ver todas</Text></TouchableOpacity>
          </View>
          {recent.length === 0 ? (
            <Text style={s.emptySection}>No hay publicaciones recientes</Text>
          ) : (
            <View style={s.recentGrid}>
              {recent.map(r => (
                <TouchableOpacity key={r.id} style={s.recentCard} activeOpacity={0.9}
                  onPress={() => navigation.navigate('PublicationDetail', { item: r })}>
                  <View style={s.recentImg}>
                    {r.photo_url
                      ? <Image source={{ uri: r.photo_url }} style={s.recentPhoto} resizeMode="cover" />
                      : <Text style={s.recentEmoji}>{EMOJI[r.category] || '🐄'}</Text>
                    }
                  </View>
                  <View style={s.recentInfo}>
                    <Text style={s.recentName} numberOfLines={1}>{r.name}</Text>
                    <Text style={s.recentBreed}>{r.breed}</Text>
                    <Text style={s.recentPrice}>$ {r.price_ars?.toLocaleString('es-AR')}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F5F7F5' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  title:         { fontSize: 24, fontWeight: '700', color: C.dark },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 14, height: 46, gap: 10, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  searchIcon:    { fontSize: 16 },
  searchInput:   { flex: 1, fontSize: 14, color: C.dark },
  loadingWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:    { fontSize: 14, color: C.gray },
  scroll:        { paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '700', color: C.dark },
  verTodos:      { fontSize: 13, color: C.green, fontWeight: '500' },
  emptySection:  { fontSize: 13, color: C.gray, paddingHorizontal: 16, marginBottom: 16, fontStyle: 'italic' },
  breedCard:     { width: 120, backgroundColor: C.white, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, elevation: 2 },
  breedEmoji:    { fontSize: 36 },
  breedName:     { fontSize: 12, fontWeight: '600', color: C.dark, textAlign: 'center' },
  breedCount:    { fontSize: 11, color: C.green, fontWeight: '500' },
  provinceList:  { paddingHorizontal: 16, backgroundColor: C.white, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  provinceRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  provinceLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  provinceIcon:  { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  provinceName:  { fontSize: 14, fontWeight: '600', color: C.dark },
  provinceCount: { fontSize: 12, color: C.gray },
  provinceArrow: { fontSize: 16, color: C.gray },
  verifiedList:  { paddingHorizontal: 16, gap: 10 },
  verifiedRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 14, gap: 12 },
  verifiedIcon:  { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  verifiedCheck: { fontSize: 20 },
  verifiedInfo:  { flex: 1 },
  verifiedName:  { fontSize: 14, fontWeight: '600', color: C.dark },
  verifiedRating:{ fontSize: 12, color: C.gray, marginTop: 2 },
  verifiedArrow: { fontSize: 16, color: C.gray },
  recentGrid:    { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  recentCard:    { width: '47%', backgroundColor: C.white, borderRadius: 14, overflow: 'hidden', elevation: 2 },
  recentImg:     { height: 100, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  recentPhoto:   { width: '100%', height: '100%' },
  recentEmoji:   { fontSize: 44 },
  recentInfo:    { padding: 10 },
  recentName:    { fontSize: 13, fontWeight: '700', color: C.dark },
  recentBreed:   { fontSize: 11, color: C.gray, marginTop: 2 },
  recentPrice:   { fontSize: 13, fontWeight: '700', color: C.green, marginTop: 4 },
  resultsTitle:  { fontSize: 14, color: C.gray, paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  resultsGrid:   { paddingHorizontal: 16, gap: 12 },
  resultCard:    { backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  resultImg:     { height: 120, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  resultPhoto:   { width: '100%', height: '100%' },
  resultEmoji:   { fontSize: 52 },
  kycBadge:      { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  resultInfo:    { padding: 12 },
  resultName:    { fontSize: 15, fontWeight: '700', color: C.dark },
  resultBreed:   { fontSize: 12, color: C.gray, marginTop: 2 },
  resultLoc:     { fontSize: 11, color: C.gray, marginTop: 2 },
  resultPrice:   { fontSize: 15, fontWeight: '700', color: C.green, marginTop: 6 },
  emptyWrap:     { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: C.dark, marginBottom: 6 },
  emptySub:      { fontSize: 14, color: C.gray, textAlign: 'center' },
});