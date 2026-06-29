import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', dark:'#1A2E1A', orange:'#FF9800', red:'#E53935', blue:'#2196F3' };

export default function AdminDashboardScreen({ navigation }) {
  const { profile } = useAuth();
  const [tab,     setTab]     = useState('Resumen');
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({
    totalUsuarios: 0, kycPendientes: 0,
    totalPubs: 0, pubsPendientes: 0,
    totalTx: 0, txPendientes: 0,
  });
  const [actividad, setActividad] = useState([]);

  const TABS = ['Resumen', 'Actividad', 'Alertas'];

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Usuarios
      const { data: usuarios } = await supabase.from('profiles').select('id, kyc_status, created_at, full_name, role').eq('role', 'user');
      const totalUsuarios  = usuarios?.length || 0;
      const kycPendientes  = usuarios?.filter(u => u.kyc_status === 'pending').length || 0;

      // Publicaciones
      const { data: pubs } = await supabase.from('publications').select('id, status, created_at, name, user_id');
      const totalPubs     = pubs?.length || 0;
      const pubsPendientes = pubs?.filter(p => p.status === 'pending').length || 0;

      // Transacciones
      const { data: txs } = await supabase.from('transactions').select('id, status, created_at, amount_ars');
      const totalTx      = txs?.length || 0;
      const txPendientes = txs?.filter(t => t.status === 'pending').length || 0;
      const totalVolumen = txs?.filter(t => t.status === 'completed').reduce((a, b) => a + (b.amount_ars || 0), 0) || 0;

      setStats({ totalUsuarios, kycPendientes, totalPubs, pubsPendientes, totalTx, txPendientes, totalVolumen });

      // Actividad reciente — últimas acciones combinadas
      const act = [];
      usuarios?.slice(0, 3).forEach(u => {
        act.push({ dot: C.green, txt: `${u.full_name || 'Usuario'} se registró`, time: formatTime(u.created_at) });
      });
      pubs?.slice(0, 3).forEach(p => {
        act.push({ dot: C.blue, txt: `Nueva publicación: ${p.name}`, time: formatTime(p.created_at) });
      });
      txs?.slice(0, 2).forEach(t => {
        act.push({ dot: C.orange, txt: `Transacción ${t.status === 'completed' ? 'completada' : 'pendiente'} — $${t.amount_ars?.toLocaleString('es-AR')}`, time: formatTime(t.created_at) });
      });
      act.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
      setActividad(act.slice(0, 6));

    } catch (e) {
      console.error('Dashboard error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 60)   return `hace ${diff} min`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)} h`;
    return `hace ${Math.floor(diff / 1440)} dias`;
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const displayName = profile?.full_name || 'Admin';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const hoy = new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const QUICK = [
    { num: stats.kycPendientes,  label: 'KYC Pendientes',      color: C.orange, route: 'AdminUsers' },
    { num: stats.pubsPendientes, label: 'Publicaciones pend.',  color: C.blue,   route: 'AdminMkt' },
    { num: stats.txPendientes,   label: 'Transac. pendientes',  color: C.red,    route: null },
    { num: stats.totalUsuarios,  label: 'Usuarios totales',     color: C.green,  route: 'AdminUsers' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>{saludo},</Text>
          <Text style={s.headerTitle}>Panel de Control</Text>
        </View>
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={s.onlineDot} />
        </View>
      </View>

      <View style={s.dateBadge}>
        <Text style={s.dateIcon}>📅</Text>
        <Text style={s.dateTxt}>{hoy}</Text>
      </View>

      <View style={s.tabsRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tabChip, tab === t && s.tabChipActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando datos...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {tab === 'Resumen' && (
            <>
              {/* Stats reales */}
              <View style={s.statsGrid}>
                <View style={s.statCard}>
                  <View style={s.statTop}><Text style={s.statIcon}>👥</Text></View>
                  <Text style={s.statNum}>{stats.totalUsuarios}</Text>
                  <Text style={s.statSub}>{stats.kycPendientes} KYC pendientes</Text>
                  <Text style={s.statLabel}>Usuarios</Text>
                </View>
                <View style={s.statCard}>
                  <View style={s.statTop}><Text style={s.statIcon}>📋</Text></View>
                  <Text style={s.statNum}>{stats.totalPubs}</Text>
                  <Text style={s.statSub}>{stats.pubsPendientes} pendientes</Text>
                  <Text style={s.statLabel}>Publicaciones</Text>
                </View>
                <View style={s.statCard}>
                  <View style={s.statTop}><Text style={s.statIcon}>💵</Text></View>
                  <Text style={s.statNum}>{stats.totalTx}</Text>
                  <Text style={s.statSub}>{stats.txPendientes} pendientes</Text>
                  <Text style={s.statLabel}>Transacciones</Text>
                </View>
                <View style={s.statCard}>
                  <View style={s.statTop}><Text style={s.statIcon}>📈</Text></View>
                  <Text style={[s.statNum, { fontSize: 16 }]}>
                    ${((stats.totalVolumen || 0) / 1000000).toFixed(1)}M
                  </Text>
                  <Text style={s.statSub}>completadas</Text>
                  <Text style={s.statLabel}>Volumen total</Text>
                </View>
              </View>

              {/* Acciones rapidas */}
              <Text style={s.sectionTitle}>Acciones Rápidas</Text>
              <View style={s.quickGrid}>
                {QUICK.map((q, i) => (
                  <TouchableOpacity key={i} style={s.quickCard}
                    onPress={() => q.route && navigation.navigate(q.route)} activeOpacity={0.8}>
                    <Text style={[s.quickNum, { color: q.color }]}>{q.num}</Text>
                    <Text style={s.quickLabel}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actividad reciente real */}
              <Text style={s.sectionTitle}>Actividad Reciente</Text>
              <View style={s.activityCard}>
                {actividad.length === 0 ? (
                  <Text style={{ color: C.muted, fontSize: 13 }}>Sin actividad reciente</Text>
                ) : actividad.map((a, i) => (
                  <View key={i} style={s.activityRow}>
                    <View style={[s.actDot, { backgroundColor: a.dot }]} />
                    <View style={s.actBody}>
                      <Text style={s.actTxt}>{a.txt}</Text>
                      <Text style={s.actTime}>{a.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {tab === 'Actividad' && (
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>Resumen General</Text>
              <Text style={s.chartSub}>Datos reales de la plataforma</Text>
              {[
                { label: 'Usuarios registrados', val: stats.totalUsuarios, color: C.green },
                { label: 'KYC pendientes',        val: stats.kycPendientes, color: C.orange },
                { label: 'Publicaciones activas', val: stats.totalPubs,    color: C.blue },
                { label: 'Transacciones totales', val: stats.totalTx,      color: C.lGreen },
              ].map((item, i) => (
                <View key={i} style={s.statRow}>
                  <Text style={s.statRowLabel}>{item.label}</Text>
                  <Text style={[s.statRowVal, { color: item.color }]}>{item.val}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'Alertas' && (
            <View style={s.alertsList}>
              {stats.kycPendientes > 0 && (
                <TouchableOpacity style={s.alertCard} onPress={() => navigation.navigate('AdminUsers')}>
                  <View style={[s.alertIconWrap, { backgroundColor: C.orange + '22' }]}>
                    <Text style={s.alertIcon}>🛡️</Text>
                  </View>
                  <View style={s.alertBody}>
                    <Text style={s.alertTxt}>{stats.kycPendientes} usuario{stats.kycPendientes > 1 ? 's' : ''} esperando verificación KYC</Text>
                    <Text style={s.alertTime}>Tocar para ver →</Text>
                  </View>
                </TouchableOpacity>
              )}
              {stats.pubsPendientes > 0 && (
                <TouchableOpacity style={s.alertCard} onPress={() => navigation.navigate('AdminMkt')}>
                  <View style={[s.alertIconWrap, { backgroundColor: C.blue + '22' }]}>
                    <Text style={s.alertIcon}>📋</Text>
                  </View>
                  <View style={s.alertBody}>
                    <Text style={s.alertTxt}>{stats.pubsPendientes} publicacion{stats.pubsPendientes > 1 ? 'es' : ''} pendiente{stats.pubsPendientes > 1 ? 's' : ''} de revisión</Text>
                    <Text style={s.alertTime}>Tocar para ver →</Text>
                  </View>
                </TouchableOpacity>
              )}
              {stats.txPendientes > 0 && (
                <View style={s.alertCard}>
                  <View style={[s.alertIconWrap, { backgroundColor: C.red + '22' }]}>
                    <Text style={s.alertIcon}>💵</Text>
                  </View>
                  <View style={s.alertBody}>
                    <Text style={s.alertTxt}>{stats.txPendientes} transaccion{stats.txPendientes > 1 ? 'es' : ''} pendiente{stats.txPendientes > 1 ? 's' : ''}</Text>
                    <Text style={s.alertTime}>Requieren confirmacion QR</Text>
                  </View>
                </View>
              )}
              {stats.kycPendientes === 0 && stats.pubsPendientes === 0 && stats.txPendientes === 0 && (
                <View style={s.alertCard}>
                  <View style={[s.alertIconWrap, { backgroundColor: C.green + '22' }]}>
                    <Text style={s.alertIcon}>✅</Text>
                  </View>
                  <View style={s.alertBody}>
                    <Text style={s.alertTxt}>Todo al dia — sin alertas pendientes</Text>
                    <Text style={s.alertTime}>Buen trabajo</Text>
                  </View>
                </View>
              )}
            </View>
          )}

        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 },
  headerSub:    { fontSize: 13, color: C.muted },
  headerTitle:  { fontSize: 24, fontWeight: '700', color: C.white },
  avatarWrap:   { position: 'relative' },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, borderWidth: 2, borderColor: C.lGreen, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: C.white },
  onlineDot:    { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: C.lGreen, borderWidth: 2, borderColor: C.bg },
  dateBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginBottom: 16, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.cardB },
  dateIcon:     { fontSize: 14 },
  dateTxt:      { fontSize: 12, color: C.muted },
  tabsRow:      { flexDirection: 'row', marginHorizontal: 20, backgroundColor: C.card, borderRadius: 14, padding: 4, gap: 4, marginBottom: 16, borderWidth: 1, borderColor: C.cardB },
  tabChip:      { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabChipActive:{ backgroundColor: C.green },
  tabTxt:       { fontSize: 13, fontWeight: '600', color: C.muted },
  tabTxtActive: { color: C.white },
  loadingWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:   { fontSize: 14, color: C.muted },
  scroll:       { paddingHorizontal: 20, paddingBottom: 100 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard:     { width: '47%', backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.cardB },
  statTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statIcon:     { fontSize: 20 },
  statNum:      { fontSize: 24, fontWeight: '700', color: C.white },
  statSub:      { fontSize: 11, color: C.muted, marginTop: 2 },
  statLabel:    { fontSize: 11, color: C.muted, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.white, marginBottom: 12 },
  quickGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  quickCard:    { width: '47%', backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardB },
  quickNum:     { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  quickLabel:   { fontSize: 12, color: C.muted, lineHeight: 16 },
  activityCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, gap: 14, borderWidth: 1, borderColor: C.cardB },
  activityRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  actDot:       { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  actBody:      { flex: 1 },
  actTxt:       { fontSize: 13, color: C.white, lineHeight: 18 },
  actTime:      { fontSize: 11, color: C.muted, marginTop: 2 },
  chartCard:    { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardB },
  chartTitle:   { fontSize: 16, fontWeight: '700', color: C.white, marginBottom: 4 },
  chartSub:     { fontSize: 12, color: C.muted, marginBottom: 20 },
  statRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.cardB },
  statRowLabel: { fontSize: 14, color: C.muted },
  statRowVal:   { fontSize: 16, fontWeight: '700' },
  alertsList:   { gap: 12 },
  alertCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardB },
  alertIconWrap:{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  alertIcon:    { fontSize: 20 },
  alertBody:    { flex: 1 },
  alertTxt:     { fontSize: 13, color: C.white, lineHeight: 18 },
  alertTime:    { fontSize: 11, color: C.muted, marginTop: 2 },
});