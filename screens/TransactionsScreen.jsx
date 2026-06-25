import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', orange:'#FF9800', red:'#E53935' };

const FILTERS = ['Todas','Completadas','Pendientes','Canceladas'];

const STATUS_LABEL = { pending:'Pendiente', completed:'Completada', cancelled:'Cancelada' };
const STATUS_COLOR = { pending:C.orange, completed:C.green, cancelled:C.red };

export default function TransactionsScreen({ navigation }) {
  const { user } = useAuth();
  const [filter,  setFilter]  = useState('Todas');
  const [txs,     setTxs]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          publications ( name, breed, category, photo_url ),
          buyer:profiles!transactions_buyer_id_fkey ( full_name ),
          seller:profiles!transactions_seller_id_fkey ( full_name )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTxs(data || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTransactions(); }, []));

  const filtered = filter === 'Todas' ? txs : txs.filter(t => {
    if (filter === 'Completadas') return t.status === 'completed';
    if (filter === 'Pendientes')  return t.status === 'pending';
    if (filter === 'Canceladas')  return t.status === 'cancelled';
    return true;
  });

  const totalCompletadas = txs
    .filter(t => t.status === 'completed' && t.buyer_id === user.id)
    .reduce((acc, t) => acc + (t.amount_ars || 0), 0);

  const pendientes = txs.filter(t => t.status === 'pending').length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Mis Transacciones</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Total */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total invertido</Text>
          <Text style={s.totalAmount}>$ {totalCompletadas.toLocaleString('es-AR')}</Text>
          <Text style={s.totalSub}>{txs.filter(t => t.status === 'completed').length} transacciones completadas</Text>
          {pendientes > 0 && (
            <View style={s.pendingAlert}>
              <Text style={s.pendingAlertTxt}>⏳ {pendientes} transaccion{pendientes > 1 ? 'es' : ''} pendiente{pendientes > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {/* Boton escanear QR — para vendedores */}
        <TouchableOpacity style={s.scanBtn} onPress={() => navigation.navigate('QRScanner')} activeOpacity={0.85}>
          <Text style={s.scanBtnIcon}>⊞</Text>
          <Text style={s.scanBtnTxt}>Escanear QR para confirmar entrega</Text>
        </TouchableOpacity>

        {/* Filtros */}
        <View style={s.filtersRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={C.green} size="large" />
            <Text style={s.loadingTxt}>Cargando transacciones...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>💵</Text>
            <Text style={s.emptyTitle}>No hay transacciones</Text>
            <Text style={s.emptySub}>Tus compras y ventas apareceran aqui</Text>
          </View>
        ) : (
          <View style={s.txList}>
            {filtered.map(tx => {
              const isBuyer    = tx.buyer_id === user.id;
              const otherParty = isBuyer ? tx.seller?.full_name : tx.buyer?.full_name;
              const pubName    = tx.publications?.name || 'Publicacion';
              const statusLabel = STATUS_LABEL[tx.status] || tx.status;
              const statusColor = STATUS_COLOR[tx.status] || C.gray;
              const fecha = new Date(tx.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' });

              return (
                <View key={tx.id} style={s.txCard}>
                  <View style={s.txTop}>
                    <View style={s.txLeft}>
                      <Text style={s.txName} numberOfLines={1}>{pubName}</Text>
                      {tx.qr_confirmed && (
                        <View style={s.qrBadge}><Text style={s.qrTxt}>⊞ QR</Text></View>
                      )}
                    </View>
                    <Text style={s.txStatusIcon}>{tx.status === 'completed' ? '✅' : tx.status === 'cancelled' ? '❌' : '⏳'}</Text>
                  </View>

                  <Text style={s.txBreed}>{tx.publications?.breed} · {tx.publications?.category}</Text>

                  <View style={s.txMeta}>
                    <Text style={s.txMetaLabel}>{isBuyer ? 'Vendedor' : 'Comprador'}</Text>
                    <Text style={s.txMetaVal}>{otherParty || '—'}</Text>
                  </View>
                  <View style={s.txMeta}>
                    <Text style={s.txMetaLabel}>Fecha</Text>
                    <Text style={s.txMetaVal}>📅 {fecha}</Text>
                  </View>
                  <View style={s.txMeta}>
                    <Text style={s.txMetaLabel}>Rol</Text>
                    <Text style={s.txMetaVal}>{isBuyer ? '🛒 Comprador' : '🏷️ Vendedor'}</Text>
                  </View>

                  <View style={s.txBottom}>
                    <Text style={s.txAmount}>$ {tx.amount_ars?.toLocaleString('es-AR')}</Text>
                    <View style={s.txRight}>
                      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
                        <Text style={[s.statusTxt, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Si es vendedor y la transaccion esta pendiente — boton para escanear */}
                  {!isBuyer && tx.status === 'pending' && (
                    <TouchableOpacity style={s.confirmBtn} onPress={() => navigation.navigate('QRScanner')}>
                      <Text style={s.confirmBtnTxt}>⊞ Escanear QR del comprador</Text>
                    </TouchableOpacity>
                  )}
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
  root:          { flex: 1, backgroundColor: '#F5F7F5' },
  header:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12 },
  backBtn:       { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:      { fontSize: 22, color: C.white, fontWeight: '300' },
  title:         { fontSize: 20, fontWeight: '700', color: C.white },
  scroll:        { paddingBottom: 100 },
  totalCard:     { backgroundColor: C.bg, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 4 },
  totalLabel:    { fontSize: 13, color: '#7AB88A' },
  totalAmount:   { fontSize: 28, fontWeight: '700', color: C.white, marginTop: 4 },
  totalSub:      { fontSize: 12, color: '#7AB88A', marginTop: 4 },
  pendingAlert:  { backgroundColor: 'rgba(255,152,0,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10, alignSelf: 'flex-start' },
  pendingAlertTxt:{ fontSize: 12, color: C.orange, fontWeight: '600' },
  scanBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.green, marginHorizontal: 16, marginTop: 16, borderRadius: 14, height: 48 },
  scanBtnIcon:   { fontSize: 20, color: C.white },
  scanBtnTxt:    { fontSize: 14, fontWeight: '700', color: C.white },
  filtersRow:    { flexDirection: 'row', backgroundColor: C.white, borderRadius: 14, margin: 16, padding: 4, gap: 2 },
  filterChip:    { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  filterChipActive:{ backgroundColor: C.bg },
  filterTxt:     { fontSize: 11, fontWeight: '600', color: C.gray },
  filterTxtActive:{ color: C.white },
  loadingWrap:   { alignItems: 'center', paddingTop: 40, gap: 12 },
  loadingTxt:    { fontSize: 14, color: C.gray },
  emptyWrap:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon:     { fontSize: 56, marginBottom: 12 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: C.dark, marginBottom: 6 },
  emptySub:      { fontSize: 14, color: C.gray, textAlign: 'center' },
  txList:        { paddingHorizontal: 16, gap: 12 },
  txCard:        { backgroundColor: C.white, borderRadius: 16, padding: 16, elevation: 2 },
  txTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  txLeft:        { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  txName:        { fontSize: 15, fontWeight: '700', color: C.dark, flex: 1 },
  qrBadge:       { backgroundColor: '#E3F2FD', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  qrTxt:         { fontSize: 11, color: '#1976D2', fontWeight: '600' },
  txStatusIcon:  { fontSize: 20 },
  txBreed:       { fontSize: 12, color: C.green, fontWeight: '500', marginBottom: 10 },
  txMeta:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  txMetaLabel:   { fontSize: 12, color: C.gray },
  txMetaVal:     { fontSize: 12, color: C.dark, fontWeight: '500' },
  txBottom:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  txAmount:      { fontSize: 18, fontWeight: '700', color: C.dark },
  txRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusTxt:     { fontSize: 12, fontWeight: '600' },
  confirmBtn:    { backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: C.green },
  confirmBtnTxt: { fontSize: 13, color: C.green, fontWeight: '700' },
});