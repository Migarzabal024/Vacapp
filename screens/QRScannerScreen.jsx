import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', dark:'#1A1A1A', muted:'#888', red:'#E53935' };

export default function QRScannerScreen({ navigation }) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const { data: tx, error } = await supabase
        .from('transactions')
        .select('*, publications(name, breed, category)')
        .eq('qr_code', data)
        .single();

      if (error || !tx) {
        Alert.alert('QR invalido', 'No se encontro ninguna transaccion con este codigo', [
          { text: 'Escanear de nuevo', onPress: () => setScanned(false) }
        ]);
        return;
      }

      if (tx.seller_id !== user.id) {
        Alert.alert('Sin permiso', 'Solo el vendedor puede confirmar esta transaccion', [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
        return;
      }

      if (tx.status !== 'pending') {
        Alert.alert('Transaccion no valida', `Esta transaccion ya fue ${tx.status === 'completed' ? 'completada' : 'cancelada'}`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      Alert.alert(
        'Confirmar entrega',
        `Queres confirmar la entrega de "${tx.publications?.name}"?\n\nMonto: $ ${tx.amount_ars?.toLocaleString('es-AR')}`,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
          { text: 'Confirmar entrega', onPress: async () => {
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                status:       'completed',
                qr_confirmed: true,
                confirmed_at: new Date().toISOString(),
              })
              .eq('id', tx.id);

            if (updateError) {
              Alert.alert('Error', 'No se pudo confirmar la transaccion');
              setScanned(false);
              return;
            }

            await supabase
              .from('publications')
              .update({ status: 'sold' })
              .eq('id', tx.publication_id);

            Alert.alert(
              'Entrega confirmada',
              'La transaccion fue completada exitosamente.',
              [{ text: 'Ver transacciones', onPress: () => navigation.replace('Transactions') }]
            );
          }},
        ]
      );
    } catch (e) {
      Alert.alert('Error', e.message);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  // Sin respuesta aun
  if (!permission) return (
    <View style={s.center}>
      <ActivityIndicator color={C.green} size="large" />
      <Text style={s.centerTxt}>Cargando camara...</Text>
    </View>
  );

  // Sin permiso
  if (!permission.granted) return (
    <View style={s.center}>
      <Text style={s.errorIcon}>📷</Text>
      <Text style={s.errorTitle}>Sin acceso a la camara</Text>
      <Text style={s.errorSub}>Necesitamos permiso para escanear el QR</Text>
      <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
        <Text style={s.permBtnTxt}>Dar permiso</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.backBtn2} onPress={() => navigation.goBack()}>
        <Text style={s.backBtn2Txt}>Volver</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View style={s.overlay}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Escanear QR</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.scanArea}>
          <View style={s.scanFrame}>
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />
          </View>
          {loading && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator color={C.white} size="large" />
              <Text style={s.loadingTxt}>Verificando...</Text>
            </View>
          )}
        </View>

        <View style={s.footer}>
          <Text style={s.footerTitle}>Escanea el QR del comprador</Text>
          <Text style={s.footerSub}>Apunta la camara al codigo QR para confirmar la entrega</Text>
          {scanned && !loading && (
            <TouchableOpacity style={s.rescanBtn} onPress={() => setScanned(false)}>
              <Text style={s.rescanTxt}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#000' },
  center:         { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  centerTxt:      { fontSize: 14, color: '#7AB88A' },
  errorIcon:      { fontSize: 56, marginBottom: 8 },
  errorTitle:     { fontSize: 20, fontWeight: '700', color: C.white },
  errorSub:       { fontSize: 14, color: '#7AB88A', textAlign: 'center' },
  permBtn:        { backgroundColor: C.green, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 16 },
  permBtnTxt:     { color: C.white, fontSize: 15, fontWeight: '700' },
  backBtn2:       { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8 },
  backBtn2Txt:    { color: '#7AB88A', fontSize: 15 },
  overlay:        { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  backIcon:       { fontSize: 18, color: C.white, fontWeight: '700' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: C.white },
  scanArea:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame:      { width: 260, height: 260, position: 'relative' },
  corner:         { position: 'absolute', width: 40, height: 40, borderColor: C.green, borderWidth: 4 },
  cornerTL:       { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR:       { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL:       { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR:       { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingTxt:     { color: C.white, fontSize: 14, fontWeight: '600' },
  footer:         { backgroundColor: 'rgba(0,0,0,0.7)', padding: 28, alignItems: 'center', gap: 8 },
  footerTitle:    { fontSize: 18, fontWeight: '700', color: C.white, textAlign: 'center' },
  footerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20 },
  rescanBtn:      { backgroundColor: C.green, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  rescanTxt:      { color: C.white, fontSize: 14, fontWeight: '700' },
});