import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', dark:'#1A1A1A', muted:'#888', border:'#E8E8E8', orange:'#FF9800', lightGreen:'#E8F5E9' };

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };
const STATUS_MAP = { active:'Activa', sold:'Vendida', paused:'Pausada', pending:'Pendiente', rejected:'Rechazada' };

export default function PublicationDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const raw = route?.params?.item || {};

  const [isFav,    setIsFav]    = useState(false);
  const [favId,    setFavId]    = useState(null);
  const [favLoad,  setFavLoad]  = useState(false);

  const item = {
    name:     raw.name      || 'Sin nombre',
    breed:    raw.breed     || '—',
    category: raw.category  || '—',
    weight:   raw.weight_kg    ? raw.weight_kg + ' kg'     : (raw.weight   || '—'),
    age:      raw.age_months   ? raw.age_months + ' meses' : (raw.age      || '—'),
    price:    raw.price_ars    ? '$ ' + raw.price_ars.toLocaleString('es-AR') : (raw.price || '—'),
    location: raw.location  || '—',
    date:     raw.created_at
                ? new Date(raw.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' })
                : (raw.date || '—'),
    status:   STATUS_MAP[raw.status] || raw.status || 'Activa',
    kyc:      raw.kyc_verified ?? raw.kyc ?? false,
    desc:     raw.description || raw.desc || '',
    emoji:    EMOJI[raw.category] || raw.emoji || '🐄',
    photoUrl: raw.photo_url  || null,
  };

  // Verificar si ya es favorito al abrir la pantalla
  useEffect(() => {
    if (!user || !raw.id) return;
    const checkFav = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('publication_id', raw.id)
        .single();
      if (data) { setIsFav(true); setFavId(data.id); }
    };
    checkFav();
  }, [raw.id]);

  // Agregar o quitar favorito
  const handleFav = async () => {
    if (!raw.id) { Alert.alert('Error', 'Esta publicacion no tiene ID valido'); return; }
    setFavLoad(true);
    try {
      if (isFav) {
        // Quitar de favoritos
        const { error } = await supabase.from('favorites').delete().eq('id', favId);
        if (error) throw error;
        setIsFav(false);
        setFavId(null);
        Alert.alert('Quitado', 'Eliminado de tus favoritos');
      } else {
        // Agregar a favoritos
        const { data, error } = await supabase.from('favorites').insert({
          user_id:        user.id,
          publication_id: raw.id,
        }).select().single();
        if (error) throw error;
        setIsFav(true);
        setFavId(data.id);
        Alert.alert('❤️ Guardado', 'Agregado a tus favoritos');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setFavLoad(false);
    }
  };

  const handleContact = () => Alert.alert('Contactar vendedor', 'Esta funcion estara disponible proximamente');
  const handleBuy = () => {
    if (raw.user_id === user.id) {
      Alert.alert('Error', 'No podes comprar tu propia publicacion');
      return;
    }
    if (!raw.id) {
      Alert.alert('Error', 'Esta publicacion no tiene ID valido');
      return;
    }
    navigation.navigate('Purchase', { item: raw });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.imgHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>

        {/* Boton favorito — rojo si ya es fav, blanco si no */}
        <TouchableOpacity style={[s.favBtn, isFav && s.favBtnActive]} onPress={handleFav} disabled={favLoad}>
          <Text style={s.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={s.headerPhoto} resizeMode="cover" />
        ) : (
          <>
            <Text style={s.mainEmoji}>{item.emoji}</Text>
            <Text style={s.imgSub}>{item.category} · {item.location}</Text>
          </>
        )}
        {item.photoUrl && (
          <View style={s.headerOverlay}>
            <Text style={s.imgSub}>{item.category} · {item.location}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.topRow}>
          <View style={s.topLeft}>
            <Text style={s.animalName}>{item.name}</Text>
            <Text style={s.price}>{item.price}</Text>
          </View>
          <View style={s.statusBadge}>
            <Text style={s.statusTxt}>{item.status}</Text>
          </View>
        </View>

        <View style={s.dataGrid}>
          {[
            ['RAZA',      item.breed],
            ['PESO',      item.weight],
            ['EDAD',      item.age],
            ['CATEGORIA', item.category],
            ['UBICACION', item.location],
            ['PUBLICADO', item.date],
          ].map(([label, val]) => (
            <View key={label} style={s.dataCell}>
              <Text style={s.dataLabel}>{label}</Text>
              <Text style={s.dataVal}>{val}</Text>
            </View>
          ))}
        </View>

        {item.kyc && (
          <View style={s.kycBanner}>
            <Text style={s.kycIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.kycTitle}>Vendedor KYC Verificado</Text>
              <Text style={s.kycSub}>Identidad y documentacion confirmada</Text>
            </View>
            <Text style={s.kycCheck}>✅</Text>
          </View>
        )}

        <View style={s.descCard}>
          <Text style={s.descLabel}>DESCRIPCION</Text>
          {item.desc
            ? <Text style={s.descTxt}>{item.desc}</Text>
            : <Text style={s.descEmpty}>Sin descripcion</Text>
          }
        </View>

        <View style={s.histCard}>
          <Text style={s.histLabel}>HISTORIAL REPRODUCTIVO</Text>
          <Text style={s.histEmpty}>Sin eventos registrados</Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={s.contactBtn} onPress={handleContact} activeOpacity={0.85}>
            <Text style={s.contactBtnTxt}>💬 Contactar vendedor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.buyBtn} onPress={handleBuy} activeOpacity={0.85}>
            <Text style={s.buyBtnTxt}>Comprar ahora →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F5F7F5' },
  imgHeader:     { backgroundColor: C.bg, height: 220, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20, position: 'relative', overflow: 'hidden' },
  headerPhoto:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  headerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 16 },
  backBtn:       { position: 'absolute', top: 52, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  backIcon:      { fontSize: 22, color: '#FFF', fontWeight: '300' },
  favBtn:        { position: 'absolute', top: 52, right: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  favBtnActive:  { backgroundColor: 'rgba(255,255,255,0.9)' },
  favIcon:       { fontSize: 18 },
  mainEmoji:     { fontSize: 80, marginBottom: 8 },
  imgSub:        { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  scroll:        { paddingBottom: 40 },
  topRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: C.white, padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  topLeft:       { flex: 1, marginRight: 12 },
  animalName:    { fontSize: 18, fontWeight: '700', color: C.dark },
  price:         { fontSize: 24, fontWeight: '700', color: C.green, marginTop: 4 },
  statusBadge:   { backgroundColor: '#FFF3E0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusTxt:     { fontSize: 12, fontWeight: '600', color: C.orange },
  dataGrid:      { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.white, padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dataCell:      { width: '46%', backgroundColor: '#F8F8F8', borderRadius: 12, padding: 12 },
  dataLabel:     { fontSize: 10, color: C.muted, letterSpacing: 0.5, marginBottom: 4 },
  dataVal:       { fontSize: 14, fontWeight: '600', color: C.dark },
  kycBanner:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.lightGreen, margin: 16, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#C8E6C9' },
  kycIcon:       { fontSize: 24 },
  kycTitle:      { fontSize: 14, fontWeight: '700', color: C.dark },
  kycSub:        { fontSize: 12, color: C.muted },
  kycCheck:      { fontSize: 20 },
  descCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, marginBottom: 12, borderRadius: 14, padding: 16 },
  descLabel:     { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 8 },
  descTxt:       { fontSize: 14, color: C.dark, lineHeight: 22 },
  descEmpty:     { fontSize: 14, color: C.muted, fontStyle: 'italic' },
  histCard:      { backgroundColor: C.white, marginHorizontal: 16, marginBottom: 20, borderRadius: 14, padding: 16 },
  histLabel:     { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 8 },
  histEmpty:     { fontSize: 14, color: C.muted, fontStyle: 'italic' },
  actions:       { paddingHorizontal: 16, gap: 10 },
  contactBtn:    { height: 50, borderRadius: 14, borderWidth: 1, borderColor: C.green, alignItems: 'center', justifyContent: 'center' },
  contactBtnTxt: { fontSize: 15, color: C.green, fontWeight: '600' },
  buyBtn:        { height: 52, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  buyBtnTxt:     { fontSize: 16, color: C.white, fontWeight: '700' },
});