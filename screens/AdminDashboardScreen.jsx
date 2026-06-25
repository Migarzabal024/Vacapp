import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', dark:'#1A2E1A', orange:'#FF9800', red:'#E53935', blue:'#2196F3' };

const QUICK = [
  { num:12, label:'Ver KYC Pendientes',    color:C.orange, route:'AdminUsers' },
  { num:8,  label:'Revisar Publicaciones', color:C.blue,   route:'AdminPublications' },
  { num:3,  label:'Atender Tickets',       color:C.red,    route:'AdminHelpDesk' },
  { num:'—',label:'Gestionar Roles',       color:C.green,  route:null },
];

const ACTIVITY = [
  { dot:C.green,  txt:'Carlos Méndez completó verificación KYC', time:'hace 5 min' },
  { dot:C.blue,   txt:'Nueva publicación requiere revisión',      time:'hace 12 min' },
  { dot:C.red,    txt:'Ticket #247 marcado urgente por Lucas A.', time:'hace 28 min' },
];

const ALERTS = [
  { icon:'🔔', color:C.green,  txt:'Carlos Méndez completó verificación KYC',     time:'hace 5 min' },
  { icon:'🔔', color:C.blue,   txt:'Nueva publicación requiere revisión',           time:'hace 12 min' },
  { icon:'🔔', color:C.red,    txt:'Ticket #247 marcado urgente por Lucas A.',      time:'hace 28 min' },
  { icon:'🔔', color:C.orange, txt:'Martina López reportó un problema de pago',    time:'hace 1 h' },
];

export default function AdminDashboardScreen({ navigation }) {
  const [tab, setTab] = useState('Resumen');
  const TABS = ['Resumen','Actividad','Alertas'];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Buenos días,</Text>
          <Text style={s.headerTitle}>Panel de Control</Text>
        </View>
        <View style={s.avatarWrap}>
          <View style={s.avatar}><Text style={s.avatarTxt}>👤</Text></View>
          <View style={s.onlineDot}/>
        </View>
      </View>

      {/* Fecha */}
      <View style={s.dateBadge}>
        <Text style={s.dateIcon}>📅</Text>
        <Text style={s.dateTxt}>Lunes, 15 de Junio 2026</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {TABS.map(t=>(
          <TouchableOpacity key={t} style={[s.tabChip, tab===t && s.tabChipActive]} onPress={()=>setTab(t)}>
            <Text style={[s.tabTxt, tab===t && s.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {tab==='Resumen' && <>
          {/* Stats */}
          <View style={s.statsGrid}>
            <View style={s.statCard}>
              <View style={s.statTop}><Text style={s.statIcon}>👥</Text><Text style={s.statBadge}>+12%</Text></View>
              <Text style={s.statNum}>1,248</Text>
              <Text style={s.statSub}>34 nuevos hoy</Text>
              <Text style={s.statLabel}>Usuarios a Cargo</Text>
            </View>
            <View style={s.statCard}>
              <View style={s.statTop}><Text style={s.statIcon}>📊</Text><Text style={s.statBadge}>+5%</Text></View>
              <Text style={s.statNum}>87%</Text>
              <Text style={s.statSub}>sesiones activas</Text>
              <Text style={s.statLabel}>Uso de la Aplicación</Text>
            </View>
            <View style={s.statCard}>
              <View style={s.statTop}><Text style={s.statIcon}>🔔</Text></View>
              <Text style={s.statNum}>24</Text>
              <Text style={s.statSub}>8 sin leer</Text>
              <Text style={s.statLabel}>Notificaciones</Text>
            </View>
            <View style={[s.statCard,{borderColor:C.red+'44'}]}>
              <View style={s.statTop}><Text style={s.statIcon}>🎫</Text><Text style={[s.statBadge,{backgroundColor:C.red+'33',color:C.red}]}>-2</Text></View>
              <Text style={s.statNum}>17</Text>
              <Text style={s.statSub}>3 urgentes</Text>
              <Text style={s.statLabel}>Tickets Activos</Text>
            </View>
          </View>

          {/* Acciones rápidas */}
          <Text style={s.sectionTitle}>Acciones Rápidas</Text>
          <View style={s.quickGrid}>
            {QUICK.map((q,i)=>(
              <TouchableOpacity key={i} style={s.quickCard} onPress={()=>q.route && navigation.navigate(q.route)} activeOpacity={0.8}>
                <Text style={[s.quickNum,{color:q.color}]}>{q.num}</Text>
                <Text style={s.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actividad reciente */}
          <Text style={s.sectionTitle}>Actividad Reciente</Text>
          <View style={s.activityCard}>
            {ACTIVITY.map((a,i)=>(
              <View key={i} style={s.activityRow}>
                <View style={[s.actDot,{backgroundColor:a.dot}]}/>
                <View style={s.actBody}>
                  <Text style={s.actTxt}>{a.txt}</Text>
                  <Text style={s.actTime}>{a.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </>}

        {tab==='Actividad' && (
          <View style={s.chartCard}>
            <Text style={s.chartTitle}>Usuarios Activos — Semana</Text>
            <Text style={s.chartSub}>Sesiones por día</Text>
            <View style={s.chart}>
              {[40,55,48,65,80,60,35].map((h,i)=>(
                <View key={i} style={s.barWrap}>
                  <View style={[s.bar,{height:h*1.5,backgroundColor:i===4?C.lGreen:C.cardB}]}/>
                  <Text style={s.barLabel}>{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][i]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab==='Alertas' && (
          <View style={s.alertsList}>
            {ALERTS.map((a,i)=>(
              <View key={i} style={s.alertCard}>
                <View style={[s.alertIconWrap,{backgroundColor:a.color+'22'}]}>
                  <Text style={s.alertIcon}>{a.icon}</Text>
                </View>
                <View style={s.alertBody}>
                  <Text style={s.alertTxt}>{a.txt}</Text>
                  <Text style={s.alertTime}>{a.time}</Text>
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
  root:{flex:1,backgroundColor:C.bg},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,paddingTop:52,paddingBottom:8},
  headerSub:{fontSize:13,color:C.muted},
  headerTitle:{fontSize:24,fontWeight:'700',color:C.white},
  avatarWrap:{position:'relative'},
  avatar:{width:44,height:44,borderRadius:22,backgroundColor:C.card,borderWidth:2,borderColor:C.green,alignItems:'center',justifyContent:'center'},
  avatarTxt:{fontSize:22},
  onlineDot:{position:'absolute',bottom:0,right:0,width:12,height:12,borderRadius:6,backgroundColor:C.lGreen,borderWidth:2,borderColor:C.bg},
  dateBadge:{flexDirection:'row',alignItems:'center',gap:6,marginHorizontal:20,marginBottom:16,backgroundColor:C.card,borderRadius:20,paddingHorizontal:12,paddingVertical:6,alignSelf:'flex-start',borderWidth:1,borderColor:C.cardB},
  dateIcon:{fontSize:14},
  dateTxt:{fontSize:12,color:C.muted},
  tabsRow:{flexDirection:'row',marginHorizontal:20,backgroundColor:C.card,borderRadius:14,padding:4,gap:4,marginBottom:16,borderWidth:1,borderColor:C.cardB},
  tabChip:{flex:1,paddingVertical:9,borderRadius:10,alignItems:'center'},
  tabChipActive:{backgroundColor:C.green},
  tabTxt:{fontSize:13,fontWeight:'600',color:C.muted},
  tabTxtActive:{color:C.white},
  scroll:{paddingHorizontal:20,paddingBottom:100},
  statsGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:20},
  statCard:{width:'47%',backgroundColor:C.card,borderRadius:16,padding:14,borderWidth:1,borderColor:C.cardB},
  statTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  statIcon:{fontSize:20},
  statBadge:{fontSize:11,fontWeight:'700',color:C.green,backgroundColor:C.cardB,paddingHorizontal:8,paddingVertical:2,borderRadius:10},
  statNum:{fontSize:24,fontWeight:'700',color:C.white},
  statSub:{fontSize:11,color:C.muted,marginTop:2},
  statLabel:{fontSize:11,color:C.muted,marginTop:4},
  sectionTitle:{fontSize:16,fontWeight:'700',color:C.white,marginBottom:12},
  quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:20},
  quickCard:{width:'47%',backgroundColor:C.card,borderRadius:14,padding:14,borderWidth:1,borderColor:C.cardB},
  quickNum:{fontSize:22,fontWeight:'700',marginBottom:4},
  quickLabel:{fontSize:12,color:C.muted,lineHeight:16},
  activityCard:{backgroundColor:C.card,borderRadius:14,padding:16,gap:14,borderWidth:1,borderColor:C.cardB},
  activityRow:{flexDirection:'row',alignItems:'flex-start',gap:12},
  actDot:{width:10,height:10,borderRadius:5,marginTop:4},
  actBody:{flex:1},
  actTxt:{fontSize:13,color:C.white,lineHeight:18},
  actTime:{fontSize:11,color:C.muted,marginTop:2},
  chartCard:{backgroundColor:C.card,borderRadius:16,padding:16,borderWidth:1,borderColor:C.cardB},
  chartTitle:{fontSize:16,fontWeight:'700',color:C.white,marginBottom:4},
  chartSub:{fontSize:12,color:C.muted,marginBottom:20},
  chart:{flexDirection:'row',alignItems:'flex-end',gap:8,height:130},
  barWrap:{flex:1,alignItems:'center',gap:6},
  bar:{width:'100%',borderRadius:4,minHeight:10},
  barLabel:{fontSize:10,color:C.muted},
  alertsList:{gap:12},
  alertCard:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.card,borderRadius:14,padding:14,borderWidth:1,borderColor:C.cardB},
  alertIconWrap:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'},
  alertIcon:{fontSize:20},
  alertBody:{flex:1},
  alertTxt:{fontSize:13,color:C.white,lineHeight:18},
  alertTime:{fontSize:11,color:C.muted,marginTop:2},
});
