import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const C = {
  bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854',
  muted:'#A0C4A8', card:'#FFFFFF', cardBg:'#F8FAF8', dark:'#1A1A1A',
  gray:'#666666', lightGray:'#F0F0F0', border:'#E8E8E8', premium:'#FFD700',
};

const CATEGORIES = [
  { id:'all', label:'Todos', icon:'🐄' },
  { id:'toros', label:'Toros', icon:'🐂' },
  { id:'vacas', label:'Vacas', icon:'🐄' },
  { id:'novillos', label:'Novillos', icon:'🥩' },
  { id:'vaquillonas', label:'Vaquillonas', icon:'🌿' },
];

const FEATURED = [
  { id:1, name:'Torito Génesis', breed:'Aberdeen Angus', location:'Córdoba, AR', price:'$ 850.000', badge:'Destacado', rating:4.9, age:'24 meses', weight:'550 kg', emoji:'🐂' },
  { id:2, name:'Vaquillona Luna', breed:'Brangus', location:'Corrientes', price:'$ 480.000', badge:'Elite', rating:4.5, age:'20 meses', weight:'380 kg', emoji:'🐄' },
];

const LISTINGS = [
  { id:1, name:'Novillo Zeus III', breed:'Braford', location:'Resistencia', price:'$ 720.000', badge:'Premium', rating:4.9, age:'24 meses', weight:'550 kg', emoji:'🐂', verified:true },
  { id:2, name:'Vaquillona Luna', breed:'Brangus', location:'Corrientes', price:'$ 480.000', badge:'Elite', rating:4.5, age:'20 meses', weight:'380 kg', emoji:'🐄', verified:true },
  { id:3, name:'Toro Prometeo', breed:'Limousin', location:'Pergamino', price:'$ 1.850.000', badge:'Élite Internacional', rating:5, age:'30 meses', weight:'820 kg', emoji:'🐂', verified:true },
  { id:4, name:'Vaca Pampa I', breed:'Angus Colorado', location:'Bahía Blanca', price:'$ 540.000', badge:'Superior', rating:4.3, age:'42 meses', weight:'490 kg', emoji:'🐄', verified:false },
];

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.welcome}>Bienvenido,</Text>
              <Text style={s.username}>martin 👋</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.notifBtn}>
                <Text style={s.notifIcon}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.avatarBtn}>
                <Text style={s.avatarEmoji}>🐄</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buscador */}
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput style={s.searchInput} placeholder="Buscar raza, animal..." placeholderTextColor="#5A8A68" />
          </View>
        </View>

        <View style={s.body}>
          {/* Stats rápidas */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statIcon}>📋</Text>
              <Text style={s.statNum}>1.240</Text>
              <Text style={s.statLabel}>Publicaciones</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>🗺️</Text>
              <Text style={s.statNum}>23</Text>
              <Text style={s.statLabel}>Provincias</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>🏆</Text>
              <Text style={s.statNum}>340+</Text>
              <Text style={s.statLabel}>Vendedores</Text>
            </View>
          </View>

          {/* Destacados */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Destacados</Text>
            <TouchableOpacity><Text style={s.verTodos}>Ver todos</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.featuredScroll} contentContainerStyle={{paddingHorizontal:16,gap:12}}>
            {FEATURED.map(item => (
              <TouchableOpacity key={item.id} style={s.featuredCard} activeOpacity={0.9}>
                <View style={s.featuredImg}>
                  <Text style={s.featuredEmoji}>{item.emoji}</Text>
                  <View style={s.featuredBadge}><Text style={s.featuredBadgeTxt}>⭐ {item.badge}</Text></View>
                </View>
                <Text style={s.featuredName}>{item.name}</Text>
                <Text style={s.featuredBreed}>{item.breed} · {item.location}</Text>
                <Text style={s.featuredPrice}>{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filtros categoría */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={{paddingHorizontal:16,gap:8}}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[s.catChip, activeCategory===cat.id && s.catChipActive]}
                onPress={()=>setActiveCategory(cat.id)}
              >
                <Text style={s.catIcon}>{cat.icon}</Text>
                <Text style={[s.catLabel, activeCategory===cat.id && s.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.resultsCount}>8 publicaciones</Text>

          {/* Grid de cards */}
          <View style={s.grid}>
            {LISTINGS.map(item => (
              <TouchableOpacity key={item.id} style={s.listingCard} activeOpacity={0.9}
                onPress={()=>navigation.navigate('PublicationDetail', { item })}>
                <View style={s.listingImg}>
                  <Text style={s.listingEmoji}>{item.emoji}</Text>
                  <View style={s.listingBadge}><Text style={s.listingBadgeTxt}>⭐ {item.badge}</Text></View>
                  {item.verified && <View style={s.verifiedBadge}><Text style={s.verifiedTxt}>🛡️</Text></View>}
                </View>
                <View style={s.listingInfo}>
                  <Text style={s.listingName}>{item.name}</Text>
                  <Text style={s.listingBreed}>{item.breed}</Text>
                  <View style={s.listingMeta}>
                    <Text style={s.listingMetaTxt}>📍 {item.location}</Text>
                    <Text style={s.listingMetaTxt}>⭐ {item.rating}</Text>
                  </View>
                  <Text style={s.listingAge}>{item.age} · {item.weight}</Text>
                  <View style={s.listingBottom}>
                    <Text style={s.listingPrice}>{item.price}</Text>
                    <TouchableOpacity style={s.arrowBtn}>
                      <Text style={s.arrowTxt}>›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  statCard:{flex:1,backgroundColor:C.white,borderRadius:14,padding:12,alignItems:'center',gap:4,shadowColor:'#000',shadowOpacity:0.05,shadowRadius:4,elevation:2},
  statIcon:{fontSize:20},
  statNum:{fontSize:16,fontWeight:'700',color:C.dark},
  statLabel:{fontSize:10,color:C.gray,textAlign:'center'},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,marginBottom:12},
  sectionTitle:{fontSize:18,fontWeight:'700',color:C.dark},
  verTodos:{fontSize:13,color:C.green,fontWeight:'500'},
  featuredScroll:{marginBottom:20},
  featuredCard:{width:180,backgroundColor:C.white,borderRadius:16,overflow:'hidden',shadowColor:'#000',shadowOpacity:0.08,shadowRadius:6,elevation:3},
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
  listingCard:{backgroundColor:C.white,borderRadius:16,overflow:'hidden',shadowColor:'#000',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  listingImg:{height:140,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center',position:'relative'},
  listingEmoji:{fontSize:60},
  listingBadge:{position:'absolute',top:10,left:10,backgroundColor:'rgba(0,0,0,0.7)',borderRadius:8,paddingHorizontal:8,paddingVertical:3},
  listingBadgeTxt:{color:'#FFD700',fontSize:10,fontWeight:'600'},
  verifiedBadge:{position:'absolute',top:10,right:10,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:20,width:32,height:32,alignItems:'center',justifyContent:'center'},
  verifiedTxt:{fontSize:16},
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
