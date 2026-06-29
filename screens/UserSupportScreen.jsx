import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator, Alert, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', orange:'#FF9800', red:'#E53935', card:'#F5F7F5' };

const URGENCY_OPTIONS = ['Baja', 'Media', 'Alta'];
const URGENCY_COLOR   = { Alta: C.red, Media: C.orange, Baja: '#2196F3' };

const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)   return `hace ${diff} min`;
  if (diff < 1440) return `hace ${Math.floor(diff / 60)} h`;
  return `hace ${Math.floor(diff / 1440)} dias`;
};

export default function UserSupportScreen({ navigation }) {
  const { user } = useAuth();

  // Lista de tickets
  const [tickets,      setTickets]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Chat
  const [chatTicket,   setChatTicket]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [loadingChat,  setLoadingChat]  = useState(false);
  const [msg,          setMsg]          = useState('');
  const [sending,      setSending]      = useState(false);

  // Nuevo ticket
  const [showNew,      setShowNew]      = useState(false);
  const [subject,      setSubject]      = useState('');
  const [urgency,      setUrgency]      = useState('Media');
  const [firstMsg,     setFirstMsg]     = useState('');
  const [creating,     setCreating]     = useState(false);

  // ── Cargar tickets del usuario ──────────────────────────
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTickets(); }, []));

  // ── Abrir chat de un ticket ─────────────────────────────
  const openChat = async (ticket) => {
    setChatTicket(ticket);
    setLoadingChat(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*, profiles(full_name)')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoadingChat(false);
    }
  };

  // ── Enviar mensaje ──────────────────────────────────────
  const sendMsg = async () => {
    if (!msg.trim() || !chatTicket) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: chatTicket.id,
          sender_id: user.id,
          message:   msg.trim(),
          is_admin:  false,
        })
        .select('*, profiles(full_name)')
        .single();
      if (error) throw error;
      setMessages(prev => [...prev, data]);
      setMsg('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  // ── Crear nuevo ticket ──────────────────────────────────
  const createTicket = async () => {
    if (!subject.trim() || !firstMsg.trim()) {
      Alert.alert('Campos requeridos', 'Completa el asunto y el mensaje');
      return;
    }
    setCreating(true);
    try {
      // Crear el ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          urgency: urgency,
          status:  'open',
        })
        .select()
        .single();
      if (ticketError) throw ticketError;

      // Enviar el primer mensaje
      await supabase.from('support_messages').insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        message:   firstMsg.trim(),
        is_admin:  false,
      });

      Alert.alert('Ticket creado', 'Tu consulta fue enviada al soporte. Te responderemos a la brevedad.');
      setShowNew(false);
      setSubject('');
      setFirstMsg('');
      setUrgency('Media');
      fetchTickets();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  };

  // ── Vista de chat ───────────────────────────────────────
  if (chatTicket) return (
    <View style={ch.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={ch.header}>
        <TouchableOpacity style={ch.backBtn} onPress={() => { setChatTicket(null); fetchTickets(); }}>
          <Text style={ch.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={ch.headerInfo}>
          <Text style={ch.headerName} numberOfLines={1}>{chatTicket.subject}</Text>
          <Text style={ch.headerSub}>
            {chatTicket.status === 'resolved' ? '✅ Resuelto' : '🟡 Abierto'} · {formatTime(chatTicket.created_at)}
          </Text>
        </View>
        <View style={[ch.urgencyBadge, { backgroundColor: (URGENCY_COLOR[chatTicket.urgency] || C.orange) + '33' }]}>
          <Text style={[ch.urgencyTxt, { color: URGENCY_COLOR[chatTicket.urgency] || C.orange }]}>
            {chatTicket.urgency}
          </Text>
        </View>
      </View>

      {loadingChat ? (
        <View style={ch.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
        </View>
      ) : (
        <ScrollView style={ch.msgList} contentContainerStyle={{ padding: 16, gap: 12 }}>
          {messages.length === 0 ? (
            <Text style={{ color: C.muted, textAlign: 'center', marginTop: 40, fontSize: 14 }}>
              Sin respuestas aun. El equipo de soporte te contactara pronto.
            </Text>
          ) : messages.map((m, i) => (
            <View key={m.id || i} style={[ch.bubble, !m.is_admin && ch.bubbleUser]}>
              <Text style={ch.bubbleTxt}>{m.message}</Text>
              <Text style={ch.bubbleTime}>
                {m.is_admin ? '🛡️ Soporte VacApp' : 'Vos'} · {formatTime(m.created_at)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {chatTicket.status === 'open' ? (
        <View style={ch.inputRow}>
          <TextInput
            style={ch.msgInput}
            placeholder="Escribi tu mensaje..."
            placeholderTextColor={C.muted}
            value={msg}
            onChangeText={setMsg}
            multiline
          />
          <TouchableOpacity style={[ch.sendBtn, sending && { opacity: 0.6 }]} onPress={sendMsg} disabled={sending}>
            {sending ? <ActivityIndicator color={C.white} size="small" /> : <Text style={ch.sendIcon}>➤</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={ch.resolvedBanner}>
          <Text style={ch.resolvedBannerTxt}>✅ Este ticket fue resuelto por el equipo de soporte</Text>
        </View>
      )}
    </View>
  );

  // ── Vista de lista de tickets ───────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Soporte & Ayuda</Text>
          <Text style={s.subtitle}>Contacta al equipo de VacApp</Text>
        </View>
      </View>

      {/* Boton nuevo ticket */}
      <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)} activeOpacity={0.85}>
        <Text style={s.newBtnIcon}>✉️</Text>
        <Text style={s.newBtnTxt}>Nueva consulta</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando consultas...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>💬</Text>
          <Text style={s.emptyTitle}>Sin consultas</Text>
          <Text style={s.emptySub}>Toca "Nueva consulta" para contactar al soporte</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {tickets.map(t => {
            const urgColor   = URGENCY_COLOR[t.urgency] || C.orange;
            const isResolved = t.status === 'resolved';
            return (
              <TouchableOpacity key={t.id} style={s.ticketCard} onPress={() => openChat(t)} activeOpacity={0.85}>
                <View style={s.ticketLeft}>
                  <View style={[s.ticketDot, { backgroundColor: isResolved ? C.green : urgColor }]} />
                </View>
                <View style={s.ticketBody}>
                  <View style={s.ticketTop}>
                    <Text style={s.ticketSubject} numberOfLines={1}>{t.subject}</Text>
                    <Text style={s.ticketTime}>{formatTime(t.created_at)}</Text>
                  </View>
                  <View style={s.ticketTags}>
                    <View style={[s.urgencyBadge, { backgroundColor: urgColor + '22' }]}>
                      <Text style={[s.urgencyTxt, { color: urgColor }]}>Urgencia: {t.urgency}</Text>
                    </View>
                    {isResolved ? (
                      <View style={s.resolvedBadge}>
                        <Text style={s.resolvedTxt}>✅ Resuelto</Text>
                      </View>
                    ) : (
                      <View style={s.openBadge}>
                        <Text style={s.openTxt}>🟡 Abierto</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Modal nuevo ticket */}
      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <View style={n.overlay}>
          <View style={n.modal}>
            <View style={n.modalHeader}>
              <Text style={n.modalTitle}>Nueva consulta</Text>
              <TouchableOpacity onPress={() => setShowNew(false)}>
                <Text style={n.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={n.label}>Asunto *</Text>
              <View style={n.inputWrap}>
                <TextInput
                  style={n.input}
                  placeholder="Ej: Problema con mi publicacion"
                  placeholderTextColor="#AAA"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <Text style={n.label}>Urgencia</Text>
              <View style={n.urgencyRow}>
                {URGENCY_OPTIONS.map(u => (
                  <TouchableOpacity key={u}
                    style={[n.urgencyChip, urgency === u && { backgroundColor: URGENCY_COLOR[u], borderColor: URGENCY_COLOR[u] }]}
                    onPress={() => setUrgency(u)}>
                    <Text style={[n.urgencyChipTxt, urgency === u && { color: C.white }]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={n.label}>Mensaje *</Text>
              <View style={[n.inputWrap, { height: 120, alignItems: 'flex-start', paddingTop: 12 }]}>
                <TextInput
                  style={[n.input, { height: 100 }]}
                  placeholder="Describe tu consulta o problema en detalle..."
                  placeholderTextColor="#AAA"
                  value={firstMsg}
                  onChangeText={setFirstMsg}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[n.sendBtn, creating && { opacity: 0.7 }]}
                onPress={createTicket}
                disabled={creating}
                activeOpacity={0.85}
              >
                {creating
                  ? <ActivityIndicator color={C.white} />
                  : <Text style={n.sendBtnTxt}>Enviar consulta ✉️</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={n.cancelBtn} onPress={() => setShowNew(false)}>
                <Text style={n.cancelBtnTxt}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.card },
  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:     { fontSize: 22, color: C.white, fontWeight: '300' },
  title:        { fontSize: 20, fontWeight: '700', color: C.white },
  subtitle:     { fontSize: 12, color: C.muted, marginTop: 2 },
  newBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.green, marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderRadius: 14, height: 50 },
  newBtnIcon:   { fontSize: 20 },
  newBtnTxt:    { fontSize: 15, fontWeight: '700', color: C.white },
  loadingWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:   { fontSize: 14, color: C.gray },
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIcon:    { fontSize: 56 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: C.dark },
  emptySub:     { fontSize: 14, color: C.gray, textAlign: 'center' },
  scroll:       { padding: 16, gap: 10, paddingBottom: 100 },
  ticketCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, padding: 16, gap: 12, elevation: 1 },
  ticketLeft:   { alignItems: 'center' },
  ticketDot:    { width: 10, height: 10, borderRadius: 5 },
  ticketBody:   { flex: 1 },
  ticketTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketSubject:{ fontSize: 14, fontWeight: '700', color: C.dark, flex: 1, marginRight: 8 },
  ticketTime:   { fontSize: 11, color: C.gray },
  ticketTags:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  urgencyTxt:   { fontSize: 11, fontWeight: '700' },
  resolvedBadge:{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: C.green + '22' },
  resolvedTxt:  { fontSize: 11, color: C.green, fontWeight: '600' },
  openBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: C.orange + '22' },
  openTxt:      { fontSize: 11, color: C.orange, fontWeight: '600' },
  chevron:      { fontSize: 20, color: C.gray },
});

const ch = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#F5F7F5' },
  header:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, gap: 10 },
  backBtn:         { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:        { fontSize: 22, color: C.white, fontWeight: '300' },
  headerInfo:      { flex: 1 },
  headerName:      { fontSize: 14, fontWeight: '700', color: C.white },
  headerSub:       { fontSize: 11, color: C.muted, marginTop: 2 },
  urgencyBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  urgencyTxt:      { fontSize: 11, fontWeight: '700' },
  loadingWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msgList:         { flex: 1 },
  bubble:          { backgroundColor: '#0D2818', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, maxWidth: '80%', alignSelf: 'flex-start' },
  bubbleUser:      { backgroundColor: C.green, borderBottomLeftRadius: 16, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  bubbleTxt:       { fontSize: 14, color: C.white, lineHeight: 20 },
  bubbleTime:      { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white },
  msgInput:        { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.dark, maxHeight: 100 },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  sendIcon:        { fontSize: 18, color: C.white },
  resolvedBanner:  { backgroundColor: C.green + '22', padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.green + '44' },
  resolvedBannerTxt:{ fontSize: 13, color: C.green, fontWeight: '600' },
});

const n = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal:         { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:    { fontSize: 18, fontWeight: '700', color: C.dark },
  closeBtn:      { fontSize: 20, color: C.gray, padding: 4 },
  label:         { fontSize: 13, fontWeight: '600', color: C.dark, marginBottom: 8, marginTop: 12 },
  inputWrap:     { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 50, justifyContent: 'center', backgroundColor: '#F8F8F8', marginBottom: 4 },
  input:         { fontSize: 14, color: C.dark },
  urgencyRow:    { flexDirection: 'row', gap: 10, marginBottom: 4 },
  urgencyChip:   { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.white },
  urgencyChipTxt:{ fontSize: 13, color: C.dark, fontWeight: '600' },
  sendBtn:       { backgroundColor: C.green, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  sendBtnTxt:    { color: C.white, fontSize: 15, fontWeight: '700' },
  cancelBtn:     { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  cancelBtnTxt:  { fontSize: 14, color: C.gray },
});