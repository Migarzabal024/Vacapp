import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, RANK_COLORS, ANIMALS_MOCK } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'AnimalDetail'>;

function formatPrice(n: number) { return '$' + n.toLocaleString('es-AR'); }

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

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: animal.image }} style={StyleSheet.absoluteFillObject as any} />
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(10,30,22,0.7)']}
            style={StyleSheet.absoluteFillObject as any} />
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBtn}>
              <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.heroBtn}>
              <Text style={{ fontSize: 18 }}>{liked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroBottom}>
            <View style={[styles.rankBadge, { backgroundColor: (RANK_COLORS as any)[animal.geneticRank] ?? COLORS.primaryDark }]}>
              <Text style={styles.rankTxt}>{animal.geneticRank}</Text>
            </View>
            <Text style={styles.heroName}>{animal.name}</Text>
            <Text style={styles.heroBreed}>{animal.breed}</Text>
          </View>
        </View>

        {/* Price */}
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
          {[['📅', 'Edad', `${animal.age} meses`], ['⚖️', 'Peso', `${animal.weight} kg`], ['📊', 'Rango', animal.geneticRank]].map(([icon, lbl, val]) => (
            <View key={lbl} style={styles.statCard}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {animal.tags.map(tag => <View key={tag} style={styles.tag}><Text style={styles.tagTxt}>{tag}</Text></View>)}
        </View>

        {/* Info cards */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🧬 Proyección Genética</Text>
          <Text style={styles.infoBody}>{animal.geneticProjection}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Historial Reproductivo</Text>
          <Text style={styles.infoBody}>{animal.reproductiveHistory}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vendedor</Text>
          <Text style={styles.infoBody}>{animal.seller} · ⭐ {animal.sellerRating} {animal.sellerVerified ? '✓ KYC' : ''}</Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.likeBtn}>
          <Text style={{ fontSize: 22 }}>{liked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReserve} disabled={reserving || reserved} style={{ flex: 1 }} activeOpacity={0.88}>
          <LinearGradient colors={reserved ? ['#1E3D2B', '#1E3D2B'] : ['#4EBA2E', '#1E3D2B']} style={styles.reserveBtn}>
            {reserving ? <ActivityIndicator color="#fff" /> : <Text style={styles.reserveTxt}>{reserved ? '✓ Reserva confirmada' : '📱 Reservar ahora'}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:         { height: 280, position: 'relative' },
  heroTop:      { position: 'absolute', top: 56, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  heroBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroBottom:   { position: 'absolute', bottom: 16, left: 16, right: 16 },
  rankBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 6 },
  rankTxt:      { color: '#fff', fontSize: 10, fontWeight: '700' },
  heroName:     { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroBreed:    { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  priceCard:    { margin: 16, marginTop: -20, backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4 },
  priceLabel:   { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  price:        { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  locationChip: { backgroundColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statsRow:     { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  statCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 4 },
  statVal:      { fontWeight: '700', fontSize: 12, color: COLORS.textPrimary, textAlign: 'center' },
  statLbl:      { fontSize: 10, color: COLORS.textSecondary },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tag:          { backgroundColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagTxt:       { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark },
  infoCard:     { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  infoTitle:    { fontWeight: '700', fontSize: 14, color: COLORS.textPrimary, marginBottom: 8 },
  infoBody:     { fontSize: 13, color: COLORS.primaryDark, lineHeight: 20 },
  bottomCta:    { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  likeBtn:      { width: 56, height: 56, borderRadius: 18, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  reserveBtn:   { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reserveTxt:   { color: '#fff', fontWeight: '600', fontSize: 15 },
});
