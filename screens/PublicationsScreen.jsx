import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', red:'#E53935', orange:'#FF9800' };
const FILTERS = ['Todas','Activas','Vendidas','Pausadas'];

const CATEGORY_EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };
const STATUS_MAP = { active:'ACTIVA', sold:'VENDIDA', paused:'PAUSADA', pending:'PENDIENTE', rejected:'RECHAZADA' };

export default function PublicationsScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [filter, setFilter]   = useState('Todas');
  const [pubs, setPubs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPubs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPubs(data || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Recarga cada vez que la pantalla recibe el foco
  useFocusEffect(useCallback(() => { fetchPubs(); }, []));

  const handleDelete = (id) => {
    Alert.alert('Eliminar publicación', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('publications').delete().eq('id', id);
        if (!error) fetchPubs();
        else Alert.alert('Error', 'No se pudo eliminar');
      }},
    ]);
  };

  const displayName = profile?.full_name?.split(' ')[0] || 'Usuario';

  const filtered = filter === 'Todas' ? pubs : pubs.filter(p => {
    if (filter === 'Activas')  return p.status === 'active';
    if (filter === 'Vendidas') return p.status === 'sold';
    if (filter === 'Pausadas') return p.status === 'paused';
    return true;
  });

  const activas  = pubs.filter(p => p.status === 'active').length;
  const vendidas = pubs.filter(p => p.status === 'sold').length;
  const pausadas = pubs.filter(p => p.status === 'paused').length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Mis Publicaciones</Text>
          <Text style={s.subtitle}>{displayName}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={()=>navigation.navigate('NewPublication')}>
          <Text style={s.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum,{color:C.green}]}>{activas}</Text>
            <Text style={s.statLabel}>Activas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum,{color:'#2196F3'}]}>{vendidas}</Text>
            <Text style={s.statLabel}>Vendidas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum,{color:C.orange}]}>{pausadas}</Text>
            <Text style={s.statLabel}>Pausadas</Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={s.filtersRow}>
          {FILTERS.map(f=>(
            <TouchableOpacity key={f} style={[s.filterChip, filter===f && s.filterChipActive]} onPress={()=>setFilter(f)}>
              <Text style={[s.filterTxt, filter===f && s.filterTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={C.green} size="large"/>
            <Text style={s.loadingTxt}>Cargando publicaciones...</Text>
          </View>
        ) : filtered.length === 0 ? (
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
            {filtered.map(pub=>{
              const statusLabel = STATUS_MAP[pub.status] || pub.status.toUpperCase();
              const emoji = CATEGORY_EMOJI[pub.category] || '🐄';
              const fecha = new Date(pub.created_at).toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'});
              return (
                <View key={pub.id} style={s.pubCard}>
                  <View style={s.pubTop}>
                    <View style={s.pubIcon}><Text style={s.pubEmoji}>{emoji}</Text></View>
                    <View style={s.pubInfo}>
                      <View style={s.pubNameRow}>
                        <Text style={s.pubName}>{pub.name}</Text>
                        <View style={[s.statusBadge, pub.status==='active' && s.statusActive]}>
                          <Text style={s.statusTxt}>{statusLabel}</Text>
                        </View>
                      </View>
                      <Text style={s.pubBreed}>{pub.breed} · {pub.category} · {pub.location}</Text>
                      <Text style={s.pubPrice}>${pub.price_ars?.toLocaleString('es-AR')}  <Text style={s.pubDate}>{fecha}</Text></Text>
                    </View>
                  </View>
                  <View style={s.pubMeta}>
                    <Text style={s.pubMetaTxt}>⚖️ {pub.weight_kg} kg</Text>
                    <Text style={s.pubMetaTxt}>📅 {pub.age_months} meses</Text>
                    <Text style={s.pubMetaTxt}>KYC {pub.kyc_verified?'✅':'❌'}</Text>
                  </View>
                  <View style={s.pubActions}>
                    <TouchableOpacity style={s.detailBtn} onPress={()=>navigation.navigate('PublicationDetail',{item:pub})}>
                      <Text style={s.detailBtnTxt}>👁️ Ver detalle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.deleteBtn} onPress={()=>handleDelete(pub.id)}>
                      <Text style={s.deleteBtnTxt}>🗑️ Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
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
  loadingWrap:{alignItems:'center',paddingTop:60,gap:12},
  loadingTxt:{fontSize:14,color:C.gray},
  empty:{alignItems:'center',paddingTop:60,paddingHorizontal:40},
  emptyIcon:{fontSize:60,marginBottom:16},
  emptyTitle:{fontSize:18,fontWeight:'700',color:C.dark,marginBottom:8},
  emptySub:{fontSize:14,color:C.gray,textAlign:'center',marginBottom:24,lineHeight:20},
  emptyBtn:{backgroundColor:C.green,borderRadius:14,paddingHorizontal:24,paddingVertical:14},
  emptyBtnTxt:{color:C.white,fontSize:15,fontWeight:'700'},
  pubList:{padding:16,gap:12},
  pubCard:{backgroundColor:C.white,borderRadius:16,padding:14,elevation:2},
  pubTop:{flexDirection:'row',gap:12,marginBottom:10},
  pubIcon:{width:48,height:48,borderRadius:12,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  pubEmoji:{fontSize:26},
  pubInfo:{flex:1},
  pubNameRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  pubName:{fontSize:15,fontWeight:'700',color:C.dark,flex:1,marginRight:8},
  statusBadge:{paddingHorizontal:10,paddingVertical:3,borderRadius:10,backgroundColor:'#F0F0F0'},
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