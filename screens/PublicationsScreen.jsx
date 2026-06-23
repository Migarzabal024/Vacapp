import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', red:'#E53935', orange:'#FF9800' };

const FILTERS = ['Todas','Activas','Vendidas','Pausadas'];

const PUBS = [
  { id:1, name:'genesisi', breed:'Hereford', category:'Toros', location:'cordoba argentiuna', price:'100000', date:'22 de jun de 2026', weight:'500 kg', age:'63 meses', kyc:true, events:0, status:'ACTIVA', emoji:'🐂' },
];

export default function PublicationsScreen({ navigation }) {
  const [filter, setFilter] = useState('Todas');
  const [pubs] = useState(PUBS);

  const filtered = filter === 'Todas' ? pubs : pubs.filter(p => p.status === filter.toUpperCase());

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Mis Publicaciones</Text>
          <Text style={s.subtitle}>martin</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={()=>navigation.navigate('NewPublication')}>
          <Text style={s.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum,{color:C.green}]}>{pubs.filter(p=>p.status==='ACTIVA').length}</Text>
            <Text style={s.statLabel}>Activas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum,{color:'#2196F3'}]}>0</Text>
            <Text style={s.statLabel}>Vendidas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum,{color:C.orange}]}>0</Text>
            <Text style={s.statLabel}>Pausadas</Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={s.filtersRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.filterChip, filter===f && s.filterChipActive]} onPress={()=>setFilter(f)}>
              <Text style={[s.filterTxt, filter===f && s.filterTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista o empty */}
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>Aún no publicaste nada</Text>
            <Text style={s.emptySub}>Tocá el botón + para crear tu primera publicación</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={()=>navigation.navigate('NewPublication')}>
              <Text style={s.emptyBtnTxt}>+ Nueva publicación</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.pubList}>
            {filtered.map(pub => (
              <View key={pub.id} style={s.pubCard}>
                <View style={s.pubTop}>
                  <View style={s.pubIcon}><Text style={s.pubEmoji}>{pub.emoji}</Text></View>
                  <View style={s.pubInfo}>
                    <View style={s.pubNameRow}>
                      <Text style={s.pubName}>{pub.name}</Text>
                      <View style={[s.statusBadge, pub.status==='ACTIVA' && s.statusActive]}>
                        <Text style={s.statusTxt}>{pub.status}</Text>
                      </View>
                    </View>
                    <Text style={s.pubBreed}>{pub.breed} · {pub.category} · {pub.location}</Text>
                    <Text style={s.pubPrice}>{pub.price}  <Text style={s.pubDate}>{pub.date}</Text></Text>
                  </View>
                </View>
                <View style={s.pubMeta}>
                  <Text style={s.pubMetaTxt}>⚖️ {pub.weight}</Text>
                  <Text style={s.pubMetaTxt}>📅 {pub.age}</Text>
                  <Text style={s.pubMetaTxt}>KYC {pub.kyc?'✅':'❌'}</Text>
                  <Text style={s.pubMetaTxt}>📋 {pub.events} eventos</Text>
                </View>
                <View style={s.pubActions}>
                  <TouchableOpacity style={s.detailBtn}><Text style={s.detailBtnTxt}>👁️ Ver detalle</Text></TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn}><Text style={s.deleteBtnTxt}>🗑️ Eliminar</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#F5F7F5'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:C.bg,paddingHorizontal:16,paddingTop:52,paddingBottom:16},
  backBtn:{width:36,height:36,borderRadius:12,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'},
  backIcon:{fontSize:22,color:C.white,fontWeight:'300'},
  title:{fontSize:20,fontWeight:'700',color:C.white},
  subtitle:{fontSize:12,color:C.muted},
  addBtn:{width:36,height:36,borderRadius:18,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  addIcon:{fontSize:24,color:C.white,fontWeight:'300'},
  scroll:{paddingBottom:100},
  statsRow:{flexDirection:'row',backgroundColor:C.bg,paddingHorizontal:16,paddingBottom:16,gap:10},
  statCard:{flex:1,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:12,padding:12,alignItems:'center'},
  statNum:{fontSize:22,fontWeight:'700'},
  statLabel:{fontSize:11,color:C.muted,marginTop:2},
  filtersRow:{flexDirection:'row',gap:8,paddingHorizontal:16,paddingVertical:14,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  filterChip:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:C.border},
  filterChipActive:{borderColor:C.green,backgroundColor:'#E8F5E9'},
  filterTxt:{fontSize:13,color:C.gray,fontWeight:'500'},
  filterTxtActive:{color:C.green},
  empty:{alignItems:'center',paddingTop:60,paddingHorizontal:40},
  emptyIcon:{fontSize:60,marginBottom:16},
  emptyTitle:{fontSize:18,fontWeight:'700',color:C.dark,marginBottom:8},
  emptySub:{fontSize:14,color:C.gray,textAlign:'center',marginBottom:24,lineHeight:20},
  emptyBtn:{backgroundColor:C.green,borderRadius:14,paddingHorizontal:24,paddingVertical:14},
  emptyBtnTxt:{color:C.white,fontSize:15,fontWeight:'700'},
  pubList:{padding:16,gap:12},
  pubCard:{backgroundColor:C.white,borderRadius:16,padding:14,shadowColor:'#000',shadowOpacity:0.05,shadowRadius:4,elevation:2},
  pubTop:{flexDirection:'row',gap:12,marginBottom:10},
  pubIcon:{width:48,height:48,borderRadius:12,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  pubEmoji:{fontSize:26},
  pubInfo:{flex:1},
  pubNameRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  pubName:{fontSize:15,fontWeight:'700',color:C.dark},
  statusBadge:{paddingHorizontal:10,paddingVertical:3,borderRadius:10},
  statusActive:{backgroundColor:'#E8F5E9'},
  statusTxt:{fontSize:11,fontWeight:'600',color:C.green},
  pubBreed:{fontSize:12,color:C.gray,marginTop:2},
  pubPrice:{fontSize:14,fontWeight:'700',color:C.green,marginTop:4},
  pubDate:{fontSize:12,color:C.gray,fontWeight:'400'},
  pubMeta:{flexDirection:'row',gap:12,flexWrap:'wrap',marginBottom:12,paddingTop:10,borderTopWidth:1,borderTopColor:'#F0F0F0'},
  pubMetaTxt:{fontSize:11,color:C.gray},
  pubActions:{flexDirection:'row',justifyContent:'space-between'},
  detailBtn:{flexDirection:'row',alignItems:'center',gap:4},
  detailBtnTxt:{fontSize:13,color:C.gray,fontWeight:'500'},
  deleteBtn:{flexDirection:'row',alignItems:'center',gap:4},
  deleteBtnTxt:{fontSize:13,color:C.red,fontWeight:'500'},
});
