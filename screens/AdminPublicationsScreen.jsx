import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', orange:'#FF9800', red:'#E53935', blue:'#2196F3' };

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };

const STATUS_LABEL = { active:'Activa', pending:'Pendiente', sold:'Vendida', paused:'Pausada', rejected:'Rechazada' };
const STATUS_COLOR = { active:C.green, pending:C.orange, sold:C.blue, paused:C.muted, rejected:C.red };

const FILTERS = ['Todas','Pendientes','Activas','Vendidas','Pausadas'];

export default function AdminPublicationsScreen({ navigation }) {
  const [filter,   setFilter]   = useState('Todas');
  const [search,   setSearch]   = useState('');
  const [pubs,     setPubs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchPubs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*, profiles(full_name, kyc_status)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPubs(data || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPubs(); }, []));

  const handleUpdateStatus = async (pubId, newStatus) => {
    try {
      const { error } = await supabase
        .from('publications')
        .update({ status: newStatus })
        .eq('id', pubId);
      if (error) throw error;
      Alert.alert('Actualizado', `Publicacion marcada como ${STATUS_LABEL[newStatus]}`);
      setSelected(null);
      fetchPubs();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (pub) => {
    Alert.alert(
      'Eliminar publicacion',
      `Seguro que queres eliminar "${pub.name}"? Esta accion no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('publications').delete().eq('id', pub.id);
          if (!error) { setSelected(null); fetchPubs(); }
          else Alert.alert('Error', 'No se pudo eliminar');
        }},
      ]
    );
  };

  const filtered = pubs.filter(p => {
    const matchFilter =
      filter === 'Todas'     ? true :
      filter === 'Pendientes'? p.status === 'pending' :
      filter === 'Activas'   ? p.status === 'active'  :
      filter === 'Vendidas'  ? p.status === 'sold'     :
      filter === 'Pausadas'  ? p.status === 'paused'   : true;
    const matchSearch = search.trim() === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.breed?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendientes = pubs.filter(p => p.status === 'pending').length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <Text style={s.title}>Publicaciones</Text>
        <Text style={s.subtitle}>{pendientes} pendientes de revision · {pubs.length} total</Text>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nombre, raza, vendedor..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: C.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}>
            <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando publicaciones...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {filtered.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>Sin publicaciones</Text>
              <Text style={s.emptySub}>No hay publicaciones para este filtro</Text>
            </View>
          ) : (
            filtered.map(pub => {
              const emoji      = EMOJI[pub.category] || '🐄';
              const statusLbl  = STATUS_LABEL[pub.status] || pub.status;
              const statusClr  = STATUS_COLOR[pub.status] || C.muted;
              const vendedor   = pub.profiles?.full_name || 'Sin nombre';
              const fecha      = new Date(pub.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' });

              return (
                <TouchableOpacity key={pub.id} style={s.pubCard}
                  onPress={() => setSelected(pub)} activeOpacity={0.85}>
                  <View style={s.pubTop}>
                    <View style={s.pubImgWrap}>
                      {pub.photo_url
                        ? <Image source={{ uri: pub.photo_url }} style={s.pubImg} resizeMode="cover" />
                        : <Text style={s.pubEmoji}>{emoji}</Text>
                      }
                    </View>
                    <View style={s.pubInfo}>
                      <View style={s.pubNameRow}>
                        <Text style={s.pubName} numberOfLines={1}>{pub.name}</Text>
                        <View style={[s.statusBadge, { backgroundColor: statusClr + '22' }]}>
                          <Text style={[s.statusTxt, { color: statusClr }]}>{statusLbl}</Text>
                        </View>
                      </View>
                      <Text style={s.pubBreed}>{pub.breed} · {pub.category}</Text>
                      <Text style={s.pubVendedor}>👤 {vendedor}</Text>
                      <Text style={s.pubMeta}>📍 {pub.location} · {fecha}</Text>
                      <Text style={s.pubPrice}>$ {pub.price_ars?.toLocaleString('es-AR')}</Text>
                    </View>
                  </View>
                  {pub.status === 'pending' && (
                    <View style={s.pendingBanner}>
                      <Text style={s.pendingBannerTxt}>⚠️ Requiere revisión del administrador</Text>
                      <View style={s.pendingActions}>
                        <TouchableOpacity style={s.rejectBtnSmall}
                          onPress={() => handleUpdateStatus(pub.id, 'rejected')}>
                          <Text style={s.rejectBtnSmallTxt}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.approveBtnSmall}
                          onPress={() => handleUpdateStatus(pub.id, 'active')}>
                          <Text style={s.approveBtnSmallTxt}>Aprobar ✓</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal detalle */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={m.overlay}>
          <View style={m.modal}>
            <View style={m.modalHeader}>
              <Text style={m.modalTitle}>Detalle de Publicacion</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={m.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Imagen */}
                <View style={m.imgWrap}>
                  {selected.photo_url
                    ? <Image source={{ uri: selected.photo_url }} style={m.img} resizeMode="cover" />
                    : <Text style={m.imgEmoji}>{EMOJI[selected.category] || '🐄'}</Text>
                  }
                </View>

                {/* Info */}
                <Text style={m.pubName}>{selected.name}</Text>
                <View style={[m.statusBadge, { backgroundColor: (STATUS_COLOR[selected.status] || C.muted) + '22', alignSelf: 'flex-start', marginBottom: 16 }]}>
                  <Text style={[m.statusTxt, { color: STATUS_COLOR[selected.status] || C.muted }]}>
                    {STATUS_LABEL[selected.status] || selected.status}
                  </Text>
                </View>

                {[
                  ['Vendedor',  selected.profiles?.full_name || '—'],
                  ['Categoria', selected.category],
                  ['Raza',      selected.breed],
                  ['Peso',      selected.weight_kg + ' kg'],
                  ['Edad',      selected.age_months + ' meses'],
                  ['Precio',    '$ ' + selected.price_ars?.toLocaleString('es-AR')],
                  ['Ubicacion', selected.location],
                  ['KYC',       selected.kyc_verified ? '✅ Verificado' : '❌ No verificado'],
                  ['Publicado', new Date(selected.created_at).toLocaleDateString('es-AR')],
                ].map(([label, val]) => (
                  <View key={label} style={m.row}>
                    <Text style={m.rowLabel}>{label}</Text>
                    <Text style={m.rowVal}>{val}</Text>
                  </View>
                ))}

                {selected.description ? (
                  <View style={m.descCard}>
                    <Text style={m.descLabel}>DESCRIPCION</Text>
                    <Text style={m.descTxt}>{selected.description}</Text>
                  </View>
                ) : null}

                {/* Acciones */}
                <View style={m.actions}>
                  {selected.status !== 'active' && (
                    <TouchableOpacity style={m.approveBtn}
                      onPress={() => handleUpdateStatus(selected.id, 'active')}>
                      <Text style={m.approveTxt}>✓ Activar</Text>
                    </TouchableOpacity>
                  )}
                  {selected.status !== 'paused' && (
                    <TouchableOpacity style={m.pauseBtn}
                      onPress={() => handleUpdateStatus(selected.id, 'paused')}>
                      <Text style={m.pauseTxt}>⏸ Pausar</Text>
                    </TouchableOpacity>
                  )}
                  {selected.status !== 'rejected' && (
                    <TouchableOpacity style={m.rejectBtn}
                      onPress={() => handleUpdateStatus(selected.id, 'rejected')}>
                      <Text style={m.rejectTxt}>✕ Rechazar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={m.deleteBtn} onPress={() => handleDelete(selected)}>
                  <Text style={m.deleteTxt}>🗑️ Eliminar publicacion</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  header:           { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12 },
  title:            { fontSize: 24, fontWeight: '700', color: C.white },
  subtitle:         { fontSize: 13, color: C.muted, marginTop: 2 },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, marginHorizontal: 20, paddingHorizontal: 14, height: 46, gap: 10, borderWidth: 1, borderColor: C.cardB, marginBottom: 12 },
  searchIcon:       { fontSize: 16 },
  searchInput:      { flex: 1, fontSize: 14, color: C.white },
  filtersRow:       { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  filterChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.cardB, backgroundColor: C.card },
  filterChipActive: { backgroundColor: C.green, borderColor: C.green },
  filterTxt:        { fontSize: 12, color: C.muted, fontWeight: '500' },
  filterTxtActive:  { color: C.white },
  loadingWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:       { fontSize: 14, color: C.muted },
  scroll:           { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  emptyWrap:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon:        { fontSize: 48 },
  emptyTitle:       { fontSize: 18, fontWeight: '700', color: C.white },
  emptySub:         { fontSize: 14, color: C.muted },
  pubCard:          { backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.cardB, gap: 10 },
  pubTop:           { flexDirection: 'row', gap: 12 },
  pubImgWrap:       { width: 64, height: 64, borderRadius: 12, backgroundColor: '#1A4A28', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pubImg:           { width: '100%', height: '100%' },
  pubEmoji:         { fontSize: 32 },
  pubInfo:          { flex: 1 },
  pubNameRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pubName:          { fontSize: 14, fontWeight: '700', color: C.white, flex: 1, marginRight: 8 },
  statusBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt:        { fontSize: 10, fontWeight: '700' },
  pubBreed:         { fontSize: 12, color: C.muted, marginBottom: 2 },
  pubVendedor:      { fontSize: 12, color: C.lGreen, marginBottom: 2 },
  pubMeta:          { fontSize: 11, color: C.muted, marginBottom: 2 },
  pubPrice:         { fontSize: 14, fontWeight: '700', color: C.green },
  pendingBanner:    { backgroundColor: C.orange + '15', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.orange + '44' },
  pendingBannerTxt: { fontSize: 12, color: C.orange, fontWeight: '600', marginBottom: 8 },
  pendingActions:   { flexDirection: 'row', gap: 8 },
  rejectBtnSmall:   { flex: 1, height: 34, borderRadius: 8, borderWidth: 1, borderColor: C.red, alignItems: 'center', justifyContent: 'center' },
  rejectBtnSmallTxt:{ fontSize: 12, color: C.red, fontWeight: '600' },
  approveBtnSmall:  { flex: 1, height: 34, borderRadius: 8, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  approveBtnSmallTxt:{ fontSize: 12, color: C.white, fontWeight: '700' },
});

const m = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal:       { backgroundColor: '#1A3D24', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: C.white },
  closeBtn:    { fontSize: 20, color: C.muted, padding: 4 },
  imgWrap:     { height: 160, backgroundColor: C.card, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
  img:         { width: '100%', height: '100%' },
  imgEmoji:    { fontSize: 64 },
  pubName:     { fontSize: 20, fontWeight: '700', color: C.white, marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusTxt:   { fontSize: 12, fontWeight: '700' },
  row:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.cardB },
  rowLabel:    { fontSize: 13, color: C.muted },
  rowVal:      { fontSize: 13, color: C.white, fontWeight: '600' },
  descCard:    { backgroundColor: C.card, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: C.cardB },
  descLabel:   { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 6 },
  descTxt:     { fontSize: 13, color: C.white, lineHeight: 20 },
  actions:     { flexDirection: 'row', gap: 8, marginTop: 16 },
  approveBtn:  { flex: 1, height: 44, borderRadius: 10, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  approveTxt:  { fontSize: 13, color: C.white, fontWeight: '700' },
  pauseBtn:    { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  pauseTxt:    { fontSize: 13, color: C.muted, fontWeight: '600' },
  rejectBtn:   { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: C.red, alignItems: 'center', justifyContent: 'center' },
  rejectTxt:   { fontSize: 13, color: C.red, fontWeight: '600' },
  deleteBtn:   { height: 44, borderRadius: 10, backgroundColor: C.red + '22', alignItems: 'center', justifyContent: 'center', marginTop: 8, borderWidth: 1, borderColor: C.red + '44' },
  deleteTxt:   { fontSize: 13, color: C.red, fontWeight: '600' },
});