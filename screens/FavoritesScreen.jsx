import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666666', border:'#E8E8E8', red:'#E53935' };

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };

export default function FavoritesScreen({ navigation }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          publication_id,
          publications (
            id, name, breed, category, weight_kg,
            age_months, price_ars, location, photo_url,
            kyc_verified, status, created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); }, []));

  const removeFavorite = (favoriteId, animalName) => {
    Alert.alert(
      'Quitar de favoritos',
      `Queres quitar a ${animalName} de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
          if (!error) fetchFavorites();
          else Alert.alert('Error', 'No se pudo quitar de favoritos');
        }},
      ]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Animales Favoritos</Text>
          <Text style={s.subtitle}>{favorites.length} guardados</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando favoritos...</Text>
        </View>
      ) : favorites.length === 0 ? (
        // Estado vacío
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>❤️</Text>
          <Text style={s.emptyTitle}>No tenes favoritos aun</Text>
          <Text style={s.emptySub}>Cuando te guste un animal toca el corazon para guardarlo aca</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={s.emptyBtnTxt}>Explorar animales</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.grid}>
            {favorites.map(fav => {
              const pub  = fav.publications;
              if (!pub) return null;
              const emoji = EMOJI[pub.category] || '🐄';
              const price = pub.price_ars ? '$ ' + pub.price_ars.toLocaleString('es-AR') : '—';
              return (
                <TouchableOpacity
                  key={fav.id}
                  style={s.card}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('PublicationDetail', { item: pub })}
                >
                  {/* Imagen o emoji */}
                  <View style={s.cardImg}>
                    {pub.photo_url ? (
                      <Image source={{ uri: pub.photo_url }} style={s.cardPhoto} resizeMode="cover" />
                    ) : (
                      <Text style={s.cardEmoji}>{emoji}</Text>
                    )}

                    {/* Boton quitar favorito */}
                    <TouchableOpacity
                      style={s.heartBtn}
                      onPress={() => removeFavorite(fav.id, pub.name)}
                    >
                      <Text style={s.heartIcon}>❤️</Text>
                    </TouchableOpacity>

                    {/* KYC badge */}
                    {pub.kyc_verified && (
                      <View style={s.kycBadge}>
                        <Text style={s.kycBadgeTxt}>🛡️</Text>
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={s.cardInfo}>
                    <Text style={s.cardName} numberOfLines={1}>{pub.name}</Text>
                    <Text style={s.cardBreed}>{pub.breed}</Text>
                    <View style={s.cardMeta}>
                      <Text style={s.cardMetaTxt}>📍 {pub.location}</Text>
                    </View>
                    <View style={s.cardMeta}>
                      <Text style={s.cardMetaTxt}>⚖️ {pub.weight_kg} kg</Text>
                      <Text style={s.cardMetaTxt}>📅 {pub.age_months} meses</Text>
                    </View>
                    <View style={s.cardBottom}>
                      <Text style={s.cardPrice}>{price}</Text>
                      <View style={s.arrowBtn}>
                        <Text style={s.arrowTxt}>›</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#F5F7F5' },
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: 22, color: C.white, fontWeight: '300' },
  title:       { fontSize: 20, fontWeight: '700', color: C.white },
  subtitle:    { fontSize: 12, color: C.muted, marginTop: 2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:  { fontSize: 14, color: C.gray },
  emptyWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon:   { fontSize: 64, marginBottom: 16 },
  emptyTitle:  { fontSize: 20, fontWeight: '700', color: C.dark, marginBottom: 8, textAlign: 'center' },
  emptySub:    { fontSize: 14, color: C.gray, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  emptyBtn:    { backgroundColor: C.green, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnTxt: { color: C.white, fontSize: 15, fontWeight: '700' },
  scroll:      { paddingBottom: 100 },
  grid:        { padding: 16, gap: 12 },

  // Card — mismo estilo que listingCard en HomeScreen
  card:        { backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  cardImg:     { height: 150, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardPhoto:   { width: '100%', height: '100%' },
  cardEmoji:   { fontSize: 64 },
  heartBtn:    { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  heartIcon:   { fontSize: 18 },
  kycBadge:    { position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  kycBadgeTxt: { fontSize: 16 },
  cardInfo:    { padding: 12 },
  cardName:    { fontSize: 15, fontWeight: '700', color: C.dark },
  cardBreed:   { fontSize: 12, color: C.gray, marginTop: 2 },
  cardMeta:    { flexDirection: 'row', gap: 12, marginTop: 4 },
  cardMetaTxt: { fontSize: 11, color: C.gray },
  cardBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardPrice:   { fontSize: 16, fontWeight: '700', color: C.green },
  arrowBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  arrowTxt:    { color: C.white, fontSize: 20, fontWeight: '700' },
});
