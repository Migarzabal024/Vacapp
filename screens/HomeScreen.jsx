import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Dimensions, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666666', border:'#E8E8E8' };

// IDs coinciden exactamente con los valores permitidos por el CHECK de tu base de datos (con mayúsculas)
const CATEGORIES = [
  { id:'all',         label:'Todos',       icon:'🐄' },
  { id:'Toros',       label:'Toros',       icon:'🐂' },
  { id:'Vacas',       label:'Vacas',       icon:'🐄' },
  { id:'Novillos',    label:'Novillos',    icon:'🥩' },
  { id:'Vaquillonas', label:'Vaquillonas', icon:'🌿' },
  { id:'Terneros',    label:'Terneros',    icon:'🐮' },
];

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };

export default function HomeScreen({ navigation }) {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para la base de datos
  const [listings, setListings] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Nombre a mostrar — usa el del perfil real o "Usuario" como fallback
  const displayName = profile?.full_name?.split(' ')[0] || 'Usuario';

  // Función para traer datos desde Supabase
  const fetchPublications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setListings(data);
        // Filtrar destacados: animales que tengan asignado algún badge (Premium, Elite, Destacado, etc.)
        const destacados = data.filter(item => item.badge !== null);
        setFeatured(destacados);
      }
    } catch (error) {
      console.error('Error cargando publicaciones en Home:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recarga los datos automáticamente cada vez que el usuario vuelve a la pantalla Home
  useFocusEffect(
    useCallback(() => {
      fetchPublications();
    }, [])
  );

  // Filtros combinados en tiempo real (Categoría + Buscador)
  const filteredListings = listings.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;

    const matchesSearch = searchQuery.trim() === '' ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.province?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.welcome}>Bienvenido,</Text>
              <Text style={s.username}>{displayName} 👋</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.notifBtn}>
                <Text style={s.notifIcon}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.avatarBtn} onPress={()=>navigation.navigate('Profile')}>
                <Text style={s.avatarEmoji}>🐄</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Buscar raza, animal, localidad..."
              placeholderTextColor="#5A8A68"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={s.body}>
          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statCard}><Text style={s.statIcon}>📋</Text><Text style={s.statNum}>{listings.length}</Text><Text style={s.statLabel}>Publicaciones</Text></View>
            <View style={s.statCard}><Text style={s.statIcon}>🗺️</Text><Text style={s.statNum}>23</Text><Text style={s.statLabel}>Provincias</Text></View>
            <View style={s.statCard}><Text style={s.statIcon}>🏆</Text><Text style={s.statNum}>340+</Text><Text style={s.statLabel}>Vendedores</Text></View>
          </View>

          {/* Loader */}
          {loading ? (
            <ActivityIndicator size="large" color={C.green} style={{ marginTop: 20 }} />
          ) : (
            <>
              {/* Destacados (Solo se muestra si hay animales con badge) */}
              {featured.length > 0 && (
                <>
                  <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>Destacados</Text>
                    <TouchableOpacity><Text style={s.verTodos}>Ver todos</Text></TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.featuredScroll} contentContainerStyle={{paddingHorizontal:16,gap:12}}>
                    {featured.map(item=>(
                      <TouchableOpacity key={item.id} style={s.featuredCard} activeOpacity={0.9}
                        onPress={()=>navigation.navigate('PublicationDetail',{item})}>
                        <View style={s.featuredImg}>
                          {item.photo_url ? (
                            <Image source={{ uri: item.photo_url }} style={s.listingPhoto} resizeMode="cover" />
                          ) : (
                            <Text style={s.featuredEmoji}>{EMOJI[item.category] || '🐂'}</Text>
                          )}
                          <View style={s.featuredBadge}><Text style={s.featuredBadgeTxt}>⭐ {item.badge}</Text></View>
                        </View>
                        <Text style={s.featuredName} numberOfLines={1}>{item.name}</Text>
                        <Text style={s.featuredBreed} numberOfLines={1}>{item.breed} · {item.location}</Text>
                        <Text style={s.featuredPrice}>$ {item.price_ars?.toLocaleString('es-AR')}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Filtros de Categorías */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{paddingHorizontal:16,gap:8}}>
                {CATEGORIES.map(cat=>(
                  <TouchableOpacity key={cat.id} style={[s.catChip, activeCategory===cat.id && s.catChipActive]} onPress={()=>setActiveCategory(cat.id)}>
                    <Text style={s.catIcon}>{cat.icon}</Text>
                    <Text style={[s.catLabel, activeCategory===cat.id && s.catLabelActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={s.resultsCount}>{filteredListings.length} publicaciones encontradas</Text>

              {/* Grid Principal */}
              <View style={s.grid}>
                {filteredListings.map(item=>(
                  <TouchableOpacity key={item.id} style={s.listingCard} activeOpacity={0.9}
                    onPress={()=>navigation.navigate('PublicationDetail',{item})}>
                    <View style={s.listingImg}>
                      {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={s.listingPhoto} resizeMode="cover" />
                      ) : (
                        <Text style={s.listingEmoji}>{EMOJI[item.category] || '🐄'}</Text>
                      )}
                      {item.badge && (
                        <View style={s.listingBadge}><Text style={s.listingBadgeTxt}>⭐ {item.badge}</Text></View>
                      )}
                      {item.kyc_verified && <View style={s.verifiedBadge}><Text>🛡️</Text></View>}
                    </View>
                    <View style={s.listingInfo}>
                      <Text style={s.listingName}>{item.name}</Text>
                      <Text style={s.listingBreed}>{item.breed}</Text>
                      <View style={s.listingMeta}>
                        <Text style={s.listingMetaTxt}>📍 {item.location}</Text>
                        <Text style={s.listingMetaTxt}>👁️ {item.views || 0}</Text>
                      </View>
                      <Text style={s.listingAge}>{item.age_months ? `${item.age_months} meses` : '—'} · {item.weight_kg ? `${item.weight_kg} kg` : '—'}</Text>
                      <View style={s.listingBottom}>
                        <Text style={s.listingPrice}>$ {item.price_ars?.toLocaleString('es-AR')}</Text>
                        <TouchableOpacity style={s.arrowBtn}><Text style={s.arrowTxt}>›</Text></TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {filteredListings.length === 0 && (
                  <Text style={{ textAlign: 'center', color: C.gray, marginTop: 20, fontStyle: 'italic' }}>
                    No hay publicaciones que coincidan con los filtros.
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#F5F7F5'},
  header:{backgroundColor:C.bg,paddingTop:52,paddingBottom:20,paddingHorizontal:20},
  headerTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  welcome:{fontSize:13,color:C.muted},
  username:{fontSize:22,fontWeight:'700',color:C.white},
  headerRight:{flexDirection:'row',gap:10,alignItems:'center'},
  notifBtn:{width:40,height:40,borderRadius:20,backgroundColor:'#1A4A28',alignItems:'center',justifyContent:'center'},
  notifIcon:{fontSize:18},
  avatarBtn:{width:40,height:40,borderRadius:20,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  avatarEmoji:{fontSize:22},
  searchBar:{flexDirection:'row',alignItems:'center',backgroundColor:'#1A4A28',borderRadius:14,paddingHorizontal:14,height:44,gap:10},
  searchIcon:{fontSize:16},
  searchInput:{flex:1,color:C.white,fontSize:14},
  body:{paddingBottom:100},
  statsRow:{flexDirection:'row',gap:10,paddingHorizontal:16,marginTop:16,marginBottom:20},
  statCard:{flex:1,backgroundColor:C.white,borderRadius:14,padding:12,alignItems:'center',gap:4,elevation:2},
  statIcon:{fontSize:20},
  statNum:{fontSize:16,fontWeight:'700',color:C.dark},
  statLabel:{fontSize:10,color:C.gray,textAlign:'center'},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,marginBottom:12},
  sectionTitle:{fontSize:18,fontWeight:'700',color:C.dark},
  verTodos:{fontSize:13,color:C.green,fontWeight:'500'},
  featuredScroll:{marginBottom:20},
  featuredCard:{width:180,backgroundColor:C.white,borderRadius:16,overflow:'hidden',elevation:3},
  featuredImg:{height:110,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center',position:'relative'},
  featuredEmoji:{fontSize:52},
  featuredBadge:{position:'absolute',top:8,left:8,backgroundColor:'#1A1A1A',borderRadius:8,paddingHorizontal:8,paddingVertical:3},
  featuredBadgeTxt:{color:'#FFD700',fontSize:10,fontWeight:'600'},
  featuredName:{fontSize:14,fontWeight:'700',color:C.dark,paddingHorizontal:10,paddingTop:8},
  featuredBreed:{fontSize:11,color:C.gray,paddingHorizontal:10,marginTop:2},
  featuredPrice:{fontSize:14,fontWeight:'700',color:C.green,paddingHorizontal:10,paddingBottom:10,marginTop:4},
  catScroll:{marginBottom:12},
  catChip:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:C.white,borderWidth:1,borderColor:C.border},
  catChipActive:{backgroundColor:C.bg,borderColor:C.bg},
  catIcon:{fontSize:14},
  catLabel:{fontSize:13,color:C.dark,fontWeight:'500'},
  catLabelActive:{color:C.white},
  resultsCount:{fontSize:13,color:C.gray,paddingHorizontal:16,marginBottom:12},
  grid:{paddingHorizontal:16,gap:12},
  listingCard:{backgroundColor:C.white,borderRadius:16,overflow:'hidden',elevation:2},
  listingImg:{height:140,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center',position:'relative'},
  listingPhoto:{width:'100%', height:'100%'}, // Estilo para soportar la foto real cargada
  listingEmoji:{fontSize:60},
  listingBadge:{position:'absolute',top:10,left:10,backgroundColor:'rgba(0,0,0,0.7)',borderRadius:8,paddingHorizontal:8,paddingVertical:3},
  listingBadgeTxt:{color:'#FFD700',fontSize:10,fontWeight:'600'},
  verifiedBadge:{position:'absolute',top:10,right:10,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:32,height:32,alignItems:'center',justifyContent:'center'},
  listingInfo:{padding:12},
  listingName:{fontSize:15,fontWeight:'700',color:C.dark},
  listingBreed:{fontSize:12,color:C.gray,marginTop:2},
  listingMeta:{flexDirection:'row',gap:12,marginTop:6},
  listingMetaTxt:{fontSize:11,color:C.gray},
  listingAge:{fontSize:11,color:C.gray,marginTop:2},
  listingBottom:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8},
  listingPrice:{fontSize:16,fontWeight:'700',color:C.green},
  arrowBtn:{width:32,height:32,borderRadius:16,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  arrowTxt:{color:C.white,fontSize:20,fontWeight:'700'},
});