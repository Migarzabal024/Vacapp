import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8' };

const BREEDS = [
  { id:1, name:'Aberdeen Angus', count:145, emoji:'🐂' },
  { id:2, name:'Hereford', count:98, emoji:'🐄' },
  { id:3, name:'Braford', count:76, emoji:'🥩' },
];

const PROVINCES = [
  { name:'Buenos Aires', count:234 },
  { name:'Córdoba', count:156 },
  { name:'Santa Fe', count:98 },
  { name:'La Pampa', count:87 },
  { name:'Entre Ríos', count:54 },
];

const VERIFIED = [
  { name:'Genética Pampeana S.A.', rating:4.9 },
  { name:'Estancia La Esperanza', rating:4.7 },
  { name:'El Fortín Ganadero', rating:5.0 },
];

const RECENT = [
  { id:1, name:'Torito Génesis', breed:'Aberdeen Angus', price:'$850k', emoji:'🐂' },
  { id:2, name:'Vaca Estrella VII', breed:'Hereford', price:'$620k', emoji:'🐄' },
  { id:3, name:'Novillo Pampero', breed:'Braford', price:'$490k', emoji:'🥩' },
  { id:4, name:'Vaquillona Sur', breed:'Brangus', price:'$380k', emoji:'🐄' },
];

export default function ExploreScreen({ navigation }) {
  const [search, setSearch] = useState('');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
      <View style={s.header}>
        <Text style={s.title}>Explorar</Text>
        <TouchableOpacity style={s.filterBtn}><Text style={s.filterIcon}>⚙️</Text></TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Buscar por raza, ubicación..." placeholderTextColor="#AAA" value={search} onChangeText={setSearch}/>
        <TouchableOpacity style={s.filterIcon2}><Text>🔽</Text></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Por Raza */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Explorar por Raza</Text>
          <TouchableOpacity><Text style={s.verTodos}>Ver todas</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16,gap:12,marginBottom:20}}>
          {BREEDS.map(b => (
            <TouchableOpacity key={b.id} style={s.breedCard}>
              <Text style={s.breedEmoji}>{b.emoji}</Text>
              <Text style={s.breedName}>{b.name}</Text>
              <Text style={s.breedCount}>{b.count} animales</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Por Provincia */}
        <Text style={[s.sectionTitle,{paddingHorizontal:16,marginBottom:12}]}>Por Provincia</Text>
        <View style={s.provinceList}>
          {PROVINCES.map((p,i) => (
            <TouchableOpacity key={i} style={s.provinceRow}>
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

        {/* Vendedores verificados */}
        <Text style={[s.sectionTitle,{paddingHorizontal:16,marginBottom:12,marginTop:20}]}>Vendedores Verificados</Text>
        <View style={s.verifiedList}>
          {VERIFIED.map((v,i) => (
            <TouchableOpacity key={i} style={s.verifiedRow}>
              <View style={s.verifiedIcon}><Text style={s.verifiedCheck}>✅</Text></View>
              <View style={s.verifiedInfo}>
                <Text style={s.verifiedName}>{v.name}</Text>
                <Text style={s.verifiedRating}>⭐ {v.rating} · KYC Verificado</Text>
              </View>
              <Text style={s.verifiedArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Publicaciones recientes */}
        <View style={[s.sectionHeader,{marginTop:20}]}>
          <Text style={s.sectionTitle}>Publicaciones Recientes</Text>
          <TouchableOpacity><Text style={s.verTodos}>Ver todas</Text></TouchableOpacity>
        </View>
        <View style={s.recentGrid}>
          {RECENT.map(r => (
            <TouchableOpacity key={r.id} style={s.recentCard}>
              <View style={s.recentImg}><Text style={s.recentEmoji}>{r.emoji}</Text></View>
              <View style={s.recentInfo}>
                <Text style={s.recentName}>{r.name}</Text>
                <Text style={s.recentBreed}>{r.breed}</Text>
                <Text style={s.recentPrice}>{r.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#F5F7F5'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingTop:52,paddingBottom:12,backgroundColor:'#F5F7F5'},
  title:{fontSize:24,fontWeight:'700',color:C.dark},
  filterBtn:{width:40,height:40,borderRadius:12,backgroundColor:'#E8E8E8',alignItems:'center',justifyContent:'center'},
  filterIcon:{fontSize:18},
  searchWrap:{flexDirection:'row',alignItems:'center',backgroundColor:C.white,borderRadius:14,marginHorizontal:16,paddingHorizontal:14,height:46,gap:10,borderWidth:1,borderColor:C.border,marginBottom:8},
  searchIcon:{fontSize:16},
  searchInput:{flex:1,fontSize:14,color:C.dark},
  filterIcon2:{fontSize:16},
  scroll:{paddingBottom:100},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,marginBottom:12},
  sectionTitle:{fontSize:17,fontWeight:'700',color:C.dark},
  verTodos:{fontSize:13,color:C.green,fontWeight:'500'},
  breedCard:{width:120,backgroundColor:C.white,borderRadius:14,padding:14,alignItems:'center',gap:6,shadowColor:'#000',shadowOpacity:0.05,shadowRadius:4,elevation:2},
  breedEmoji:{fontSize:36},
  breedName:{fontSize:12,fontWeight:'600',color:C.dark,textAlign:'center'},
  breedCount:{fontSize:11,color:C.green,fontWeight:'500'},
  provinceList:{paddingHorizontal:16,gap:0,backgroundColor:C.white,marginHorizontal:16,borderRadius:16,overflow:'hidden'},
  provinceRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
  provinceLeft:{flexDirection:'row',alignItems:'center',gap:12},
  provinceIcon:{width:36,height:36,borderRadius:18,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  provinceName:{fontSize:14,fontWeight:'600',color:C.dark},
  provinceCount:{fontSize:12,color:C.gray},
  provinceArrow:{fontSize:16,color:C.gray},
  verifiedList:{paddingHorizontal:16,gap:10},
  verifiedRow:{flexDirection:'row',alignItems:'center',backgroundColor:C.white,borderRadius:14,padding:14,gap:12},
  verifiedIcon:{width:40,height:40,borderRadius:10,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  verifiedCheck:{fontSize:20},
  verifiedInfo:{flex:1},
  verifiedName:{fontSize:14,fontWeight:'600',color:C.dark},
  verifiedRating:{fontSize:12,color:C.gray,marginTop:2},
  verifiedArrow:{fontSize:16,color:C.gray},
  recentGrid:{paddingHorizontal:16,flexDirection:'row',flexWrap:'wrap',gap:12},
  recentCard:{width:'47%',backgroundColor:C.white,borderRadius:14,overflow:'hidden',shadowColor:'#000',shadowOpacity:0.05,shadowRadius:4,elevation:2},
  recentImg:{height:100,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  recentEmoji:{fontSize:44},
  recentInfo:{padding:10},
  recentName:{fontSize:13,fontWeight:'700',color:C.dark},
  recentBreed:{fontSize:11,color:C.gray,marginTop:2},
  recentPrice:{fontSize:13,fontWeight:'700',color:C.green,marginTop:4},
});
