import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, CATEGORIAS, RANK_COLORS, ANIMALS_MOCK } from '../constants';
import type { CategoriaAnimal } from '../types';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 12) / 2;

function formatPrice(n: number) {
  return '$' + n.toLocaleString('es-AR');
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [category, setCategory] = useState<CategoriaAnimal>('todos');
  const [search, setSearch]     = useState('');

  const filtered = ANIMALS_MOCK.filter(a => {
    const matchCat  = category === 'todos' || a.category === category;
    const matchSrch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.breed.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Bienvenido,</Text>
            <Text style={styles.username}>VacApp 🐄</Text>
          </View>
          <View style={styles.avatar}><Text style={{ fontSize: 22 }}>🐄</Text></View>
        </View>
        <View style={styles.searchWrap}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Buscar raza, animal..."
            placeholderTextColor="rgba(255,255,255,0.4)" value={search} onChangeText={setSearch} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 16 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity key={cat.key} onPress={() => setCategory(cat.key)}
              style={[styles.catBtn, category === cat.key && styles.catBtnActive]}>
              <Text>{cat.emoji}</Text>
              <Text style={[styles.catTxt, category === cat.key && { color: '#fff', fontWeight: '600' }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{filtered.length} publicaciones</Text>

        {/* Grid */}
        <View style={styles.grid}>
          {filtered.map(a => (
            <TouchableOpacity key={a.id} onPress={() => navigation.navigate('AnimalDetail', { id: a.id })}
              activeOpacity={0.9} style={[styles.card, { width: CARD_W }]}>
              <View style={styles.cardImgWrap}>
                <Image source={{ uri: a.image }} style={styles.cardImg} />
                <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[a.geneticRank] }]}>
                  <Text style={styles.rankTxt}>{a.geneticRank}</Text>
                </View>
                <View style={styles.cardNameWrap}>
                  <Text style={styles.cardName} numberOfLines={1}>{a.name}</Text>
                  <Text style={styles.cardBreed} numberOfLines={1}>{a.breed}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardMeta}>📍 {a.location} · ⭐ {a.sellerRating}</Text>
                <Text style={styles.cardMeta}>{a.age} meses · {a.weight} kg</Text>
                <Text style={styles.cardPrice}>{formatPrice(a.price)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome:      { color: COLORS.olive, fontSize: 12 },
  username:     { color: '#fff', fontSize: 20, fontWeight: '700' },
  avatar:       { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchInput:  { flex: 1, color: '#fff', fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, paddingHorizontal: 16, marginBottom: 8 },
  catBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20 },
  catBtnActive: { backgroundColor: COLORS.primaryDark },
  catTxt:       { fontSize: 13, color: COLORS.textSecondary },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  card:         { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  cardImgWrap:  { height: 150, position: 'relative' },
  cardImg:      { width: '100%', height: '100%' },
  rankBadge:    { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rankTxt:      { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardNameWrap: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  cardName:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  cardBreed:    { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  cardBody:     { padding: 10, gap: 3 },
  cardMeta:     { fontSize: 10, color: COLORS.textSecondary },
  cardPrice:    { fontWeight: '700', fontSize: 14, color: COLORS.textPrimary, marginTop: 4 },
});
