import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', dark:'#1A1A1A', muted:'#888', border:'#E8E8E8', orange:'#FF9800' };

const EMOJI = { Toros:'🐂', Vacas:'🐄', Novillos:'🥩', Vaquillonas:'🌿', Terneros:'🐮', Reproductores:'🏆' };

export default function PurchaseScreen({ navigation, route }) {
  const { user, profile } = useAuth();
  const { item } = route.params;

  const [loading,     setLoading]     = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [step,        setStep]        = useState('confirm'); // confirm | qr | done

  const price = item.price_ars
    ? '$ ' + item.price_ars.toLocaleString('es-AR')
    : item.price || '—';

  const emoji = EMOJI[item.category] || '🐄';

  // Crear transaccion en Supabase
  const createTransaction = async () => {
    if (item.user_id === user.id) {
      Alert.alert('Error', 'No podes comprar tu propia publicacion');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          publication_id: item.id,
          buyer_id:       user.id,
          seller_id:      item.user_id,
          amount_ars:     item.price_ars,
          status:         'pending',
          location:       item.location,
        })
        .select()
        .single();

      if (error) throw error;
      setTransaction(data);
      setStep('qr');
    } catch (e) {
      Alert.alert('Error al iniciar compra', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!transaction) { navigation.goBack(); return; }
    Alert.alert('Cancelar compra', 'Queres cancelar esta transaccion?', [
      { text: 'No', style: 'cancel' },
      { text: 'Si, cancelar', style: 'destructive', onPress: async () => {
        await supabase.from('transactions').update({ status: 'cancelled' }).eq('id', transaction.id);
        navigation.goBack();
      }},
    ]);
  };

  // Paso 1 — Confirmacion
  if (step === 'confirm') return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Confirmar Compra</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Resumen del animal */}
        <View style={s.animalCard}>
          <Text style={s.animalEmoji}>{emoji}</Text>
          <View style={s.animalInfo}>
            <Text style={s.animalName}>{item.name}</Text>
            <Text style={s.animalBreed}>{item.breed} · {item.category}</Text>
            <Text style={s.animalLoc}>📍 {item.location}</Text>
          </View>
        </View>

        {/* Detalles de la transaccion */}
        <View style={s.detailCard}>
          <Text style={s.detailTitle}>DETALLE DE LA COMPRA</Text>
          {[
            ['Animal',    item.name],
            ['Raza',      item.breed],
            ['Peso',      item.weight_kg ? item.weight_kg + ' kg' : '—'],
            ['Edad',      item.age_months ? item.age_months + ' meses' : '—'],
            ['Ubicacion', item.location],
            ['Vendedor',  item.user_id === user.id ? 'Tu publicacion' : 'Otro vendedor'],
          ].map(([label, val]) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailVal}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Precio total */}
        <View style={s.priceCard}>
          <Text style={s.priceLabel}>Total a pagar</Text>
          <Text style={s.priceAmount}>{price}</Text>
          <Text style={s.priceSub}>El pago se acuerda directamente con el vendedor</Text>
        </View>

        {/* Info QR */}
        <View style={s.infoCard}>
          <Text style={s.infoIcon}>📱</Text>
          <View style={s.infoBody}>
            <Text style={s.infoTitle}>Como funciona el QR</Text>
            <Text style={s.infoDesc}>Se generara un codigo QR unico. En el campo, el vendedor lo escanea para confirmar la entrega del animal. Esto sirve como evidencia legal de la transaccion.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={createTransaction}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.white} />
            : <Text style={s.confirmBtnTxt}>Generar QR de compra →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelBtnTxt}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Paso 2 — QR generado
  if (step === 'qr') return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleCancel}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Tu QR de Compra</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollQR}>
        <View style={s.qrSection}>
          <Text style={s.qrTitle}>Mostra este QR al vendedor</Text>
          <Text style={s.qrSub}>El vendedor lo escanea para confirmar la entrega</Text>

          {/* QR Code */}
          <View style={s.qrBox}>
            <QRCode
              value={transaction?.qr_code || 'vacapp-qr'}
              size={220}
              backgroundColor="white"
              color="#0D2818"
            />
          </View>

          <View style={s.qrInfoRow}>
            <Text style={s.qrInfoLabel}>ID Transaccion</Text>
            <Text style={s.qrInfoVal}>{transaction?.id?.slice(0,8).toUpperCase()}...</Text>
          </View>
          <View style={s.qrInfoRow}>
            <Text style={s.qrInfoLabel}>Animal</Text>
            <Text style={s.qrInfoVal}>{item.name}</Text>
          </View>
          <View style={s.qrInfoRow}>
            <Text style={s.qrInfoLabel}>Monto</Text>
            <Text style={[s.qrInfoVal, { color: C.green, fontWeight: '700' }]}>{price}</Text>
          </View>
          <View style={s.qrInfoRow}>
            <Text style={s.qrInfoLabel}>Estado</Text>
            <View style={s.pendingBadge}>
              <Text style={s.pendingBadgeTxt}>⏳ Pendiente</Text>
            </View>
          </View>
        </View>

        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>Proximos pasos</Text>
          {[
            ['1', 'Coordina con el vendedor el lugar y fecha de entrega'],
            ['2', 'En el campo, mostra este QR al vendedor'],
            ['3', 'El vendedor lo escanea con su app'],
            ['4', 'La transaccion se confirma automaticamente'],
          ].map(([num, txt]) => (
            <View key={num} style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumTxt}>{num}</Text></View>
              <Text style={s.stepTxt}>{txt}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={s.doneBtn}
          onPress={() => navigation.replace('Transactions')}
          activeOpacity={0.85}
        >
          <Text style={s.doneBtnTxt}>Ver mis transacciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
          <Text style={s.cancelBtnTxt}>Cancelar transaccion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#F5F7F5' },
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12 },
  backBtn:        { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:       { fontSize: 22, color: C.white, fontWeight: '300' },
  headerTitle:    { fontSize: 20, fontWeight: '700', color: C.white },
  scroll:         { padding: 16, paddingBottom: 60 },
  scrollQR:       { padding: 16, paddingBottom: 60, alignItems: 'center' },
  animalCard:     { flexDirection: 'row', backgroundColor: C.white, borderRadius: 16, padding: 16, gap: 14, marginBottom: 12, alignItems: 'center', elevation: 2 },
  animalEmoji:    { fontSize: 48 },
  animalInfo:     { flex: 1 },
  animalName:     { fontSize: 16, fontWeight: '700', color: C.dark },
  animalBreed:    { fontSize: 13, color: C.muted, marginTop: 2 },
  animalLoc:      { fontSize: 12, color: C.muted, marginTop: 4 },
  detailCard:     { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  detailTitle:    { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 12 },
  detailRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  detailLabel:    { fontSize: 13, color: C.muted },
  detailVal:      { fontSize: 13, color: C.dark, fontWeight: '600' },
  priceCard:      { backgroundColor: C.bg, borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center' },
  priceLabel:     { fontSize: 13, color: C.muted },
  priceAmount:    { fontSize: 32, fontWeight: '700', color: C.white, marginTop: 4 },
  priceSub:       { fontSize: 11, color: C.muted, marginTop: 8, textAlign: 'center' },
  infoCard:       { flexDirection: 'row', backgroundColor: '#E8F5E9', borderRadius: 14, padding: 14, gap: 12, marginBottom: 20, borderWidth: 1, borderColor: '#C8E6C9' },
  infoIcon:       { fontSize: 24 },
  infoBody:       { flex: 1 },
  infoTitle:      { fontSize: 14, fontWeight: '700', color: C.dark, marginBottom: 4 },
  infoDesc:       { fontSize: 12, color: C.muted, lineHeight: 18 },
  confirmBtn:     { backgroundColor: C.green, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  confirmBtnTxt:  { color: C.white, fontSize: 16, fontWeight: '700' },
  cancelBtn:      { height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center' },
  cancelBtnTxt:   { fontSize: 14, color: C.muted, fontWeight: '500' },
  qrSection:      { backgroundColor: C.white, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center', marginBottom: 16, elevation: 3 },
  qrTitle:        { fontSize: 18, fontWeight: '700', color: C.dark, marginBottom: 6, textAlign: 'center' },
  qrSub:          { fontSize: 13, color: C.muted, marginBottom: 24, textAlign: 'center' },
  qrBox:          { padding: 16, backgroundColor: C.white, borderRadius: 16, borderWidth: 2, borderColor: '#E8F5E9', marginBottom: 20 },
  qrInfoRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  qrInfoLabel:    { fontSize: 13, color: C.muted },
  qrInfoVal:      { fontSize: 13, color: C.dark, fontWeight: '600' },
  pendingBadge:   { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pendingBadgeTxt:{ fontSize: 12, color: C.orange, fontWeight: '600' },
  stepsCard:      { backgroundColor: C.white, borderRadius: 16, padding: 16, width: '100%', marginBottom: 16, elevation: 2 },
  stepsTitle:     { fontSize: 15, fontWeight: '700', color: C.dark, marginBottom: 14 },
  stepRow:        { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  stepNum:        { width: 28, height: 28, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt:     { fontSize: 13, fontWeight: '700', color: C.white },
  stepTxt:        { flex: 1, fontSize: 13, color: C.dark, lineHeight: 20 },
  doneBtn:        { backgroundColor: C.green, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 10 },
  doneBtnTxt:     { color: C.white, fontSize: 16, fontWeight: '700' },
});