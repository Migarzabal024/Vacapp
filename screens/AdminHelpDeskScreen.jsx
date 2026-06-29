import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', orange:'#FF9800', red:'#E53935', blue:'#2196F3' };

const URGENCY_COLOR = { Alta: C.red, Media: C.orange, Baja: C.blue };
const FILTERS = ['Todos', 'Abiertos', 'Resueltos'];

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)   return `hace ${diff} min`;
  if (diff < 1440) return `hace ${Math.floor(diff / 60)} h`;
  return `hace ${Math.floor(diff / 1440)} dias`;
};

export default function AdminHelpDeskScreen({ navigation }) {
  const { user } = useAuth();
  const [filter,      setFilter]      = useState('Todos');
  const [tickets,     setTickets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [chatTicket,  setChatTicket]  = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [msg,         setMsg]         = useState('');
  const [sending,     setSending]     = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, profiles(full_name, kyc_status)')
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
          is_admin:  true,
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

  const resolveTicket = async () => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', chatTicket.id);
      if (error) throw error;
      Alert.alert('Resuelto', 'El ticket fue marcado como resuelto', [
        { text: 'OK', onPress: () => { setChatTicket(null); fetchTickets(); } }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const reopenTicket = async () => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'open' })
        .eq('id', chatTicket.id);
      if (error) throw error;
      Alert.alert('Reabierto', 'El ticket fue reabierto');
      setChatTicket(prev => ({ ...prev, status: 'open' }));
      fetchTickets();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const filtered = tickets.filter(t => {
    if (filter === 'Abiertos')  return t.status === 'open';
    if (filter === 'Resueltos') return t.status === 'resolved';
    return true;
  });

  const abiertos  = tickets.filter(t => t.status === 'open').length;
  const urgentes  = tickets.filter(t => t.status === 'open' && t.urgency === 'Alta').length;

  // ── Vista de chat ──────────────────────────────────────────
  if (chatTicket) return (
    <View style={ch.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={ch.header}>
        <TouchableOpacity style={ch.backBtn} onPress={() => setChatTicket(null)}>
          <Text style={ch.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={ch.headerAvatar}>
          <Text style={ch.headerInitials}>{getInitials(chatTicket.profiles?.full_name)}</Text>
        </View>
        <View style={ch.headerInfo}>
          <Text style={ch.headerName}>{chatTicket.profiles?.full_name || 'Usuario'}</Text>
          <Text style={ch.headerSubject} numberOfLines={1}>{chatTicket.subject}</Text>
        </View>
        <View style={[ch.urgencyBadge, { backgroundColor: (URGENCY_COLOR[chatTicket.urgency] || C.blue) + '33' }]}>
          <Text style={[ch.urgencyTxt, { color: URGENCY_COLOR[chatTicket.urgency] || C.blue }]}>
            {chatTicket.urgency || 'Baja'}
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
              Sin mensajes aun. Escribi el primero.
            </Text>
          ) : messages.map((m, i) => (
            <View key={m.id || i} style={[ch.bubble, m.is_admin && ch.bubbleAdmin]}>
              <Text style={[ch.bubbleTxt, m.is_admin && ch.bubbleTxtAdmin]}>{m.message}</Text>
              <Text style={[ch.bubbleTime, m.is_admin && ch.bubbleTimeAdmin]}>
                {m.is_admin ? 'Admin' : (m.profiles?.full_name || 'Usuario')} · {formatTime(m.created_at)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {chatTicket.status === 'open' ? (
        <TouchableOpacity style={ch.resolveBtn} onPress={resolveTicket}>
          <Text style={ch.resolveTxt}>✓ Marcar como Resuelto</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[ch.resolveBtn, { borderColor: C.orange }]} onPress={reopenTicket}>
          <Text style={[ch.resolveTxt, { color: C.orange }]}>↩ Reabrir ticket</Text>
        </TouchableOpacity>
      )}

      <View style={ch.inputRow}>
        <TextInput
          style={ch.msgInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={C.muted}
          value={msg}
          onChangeText={setMsg}
          multiline
        />
        <TouchableOpacity style={[ch.sendBtn, sending && { opacity: 0.6 }]} onPress={sendMsg} disabled={sending}>
          {sending ? <ActivityIndicator color={C.white} size="small" /> : <Text style={ch.sendIcon}>➤</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Vista de lista ─────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <Text style={s.title}>Help Desk</Text>
        <Text style={s.subtitle}>{abiertos} abiertos · {urgentes} urgentes</Text>
      </View>

      <View style={s.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}>
            <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={s.loadingTxt}>Cargando tickets...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>💬</Text>
          <Text style={s.emptyTitle}>Sin tickets</Text>
          <Text style={s.emptySub}>No hay tickets para este filtro</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {filtered.map(t => {
            const urgColor  = URGENCY_COLOR[t.urgency] || C.blue;
            const initials  = getInitials(t.profiles?.full_name);
            const isResolved = t.status === 'resolved';
            return (
              <TouchableOpacity key={t.id}
                style={[s.ticketCard, t.urgency === 'Alta' && !isResolved && s.ticketUrgent]}
                onPress={() => openChat(t)} activeOpacity={0.85}>
                <View style={s.ticketLeft}>
                  <View style={[s.avatar, { backgroundColor: urgColor }]}>
                    <Text style={s.avatarTxt}>{initials}</Text>
                  </View>
                  {!isResolved && <View style={[s.unreadDot, { backgroundColor: urgColor }]} />}
                </View>
                <View style={s.ticketBody}>
                  <View style={s.ticketTop}>
                    <Text style={s.ticketName}>{t.profiles?.full_name || 'Usuario'}</Text>
                    <Text style={s.ticketTime}>{formatTime(t.created_at)}</Text>
                  </View>
                  <Text style={s.ticketSubject}>{t.subject}</Text>
                  <View style={s.ticketTags}>
                    <View style={[s.urgencyBadge, { backgroundColor: urgColor + '22' }]}>
                      <Text style={[s.urgencyTxt, { color: urgColor }]}>Urgencia: {t.urgency || 'Baja'}</Text>
                    </View>
                    {isResolved && (
                      <View style={s.resolvedBadge}>
                        <Text style={s.resolvedTxt}>Resuelto</Text>
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
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  title:          { fontSize: 24, fontWeight: '700', color: C.white },
  subtitle:       { fontSize: 13, color: C.muted, marginTop: 2 },
  filtersRow:     { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterChip:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.cardB, backgroundColor: C.card },
  filterChipActive:{ backgroundColor: C.green, borderColor: C.green },
  filterTxt:      { fontSize: 13, color: C.muted, fontWeight: '500' },
  filterTxtActive:{ color: C.white },
  loadingWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:     { fontSize: 14, color: C.muted },
  emptyWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon:      { fontSize: 48 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: C.white },
  emptySub:       { fontSize: 14, color: C.muted },
  scroll:         { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  ticketCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: C.cardB },
  ticketUrgent:   { borderColor: C.red + '44', borderWidth: 1.5 },
  ticketLeft:     { alignItems: 'center', gap: 4 },
  avatar:         { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:      { fontSize: 16, fontWeight: '700', color: C.white },
  unreadDot:      { width: 8, height: 8, borderRadius: 4 },
  ticketBody:     { flex: 1 },
  ticketTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  ticketName:     { fontSize: 14, fontWeight: '700', color: C.white },
  ticketTime:     { fontSize: 11, color: C.muted },
  ticketSubject:  { fontSize: 13, color: C.white, marginBottom: 6 },
  ticketTags:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  urgencyBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  urgencyTxt:     { fontSize: 11, fontWeight: '700' },
  resolvedBadge:  { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: C.green + '22' },
  resolvedTxt:    { fontSize: 11, color: C.green, fontWeight: '600' },
  chevron:        { fontSize: 20, color: C.muted },
});

const ch = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.bg },
  header:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: C.cardB },
  backBtn:         { width: 34, height: 34, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  backIcon:        { fontSize: 22, color: C.white, fontWeight: '300' },
  headerAvatar:    { width: 38, height: 38, borderRadius: 19, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  headerInitials:  { fontSize: 14, fontWeight: '700', color: C.white },
  headerInfo:      { flex: 1 },
  headerName:      { fontSize: 14, fontWeight: '700', color: C.white },
  headerSubject:   { fontSize: 11, color: C.muted },
  urgencyBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  urgencyTxt:      { fontSize: 11, fontWeight: '700' },
  loadingWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msgList:         { flex: 1 },
  bubble:          { backgroundColor: C.card, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, maxWidth: '80%', alignSelf: 'flex-start', borderWidth: 1, borderColor: C.cardB },
  bubbleAdmin:     { backgroundColor: C.green, borderBottomLeftRadius: 16, borderBottomRightRadius: 4, alignSelf: 'flex-end', borderColor: C.green },
  bubbleTxt:       { fontSize: 14, color: C.white, lineHeight: 20 },
  bubbleTxtAdmin:  { color: C.white },
  bubbleTime:      { fontSize: 10, color: C.muted, marginTop: 4 },
  bubbleTimeAdmin: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  resolveBtn:      { margin: 16, backgroundColor: C.card, borderRadius: 14, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.green },
  resolveTxt:      { fontSize: 14, color: C.lGreen, fontWeight: '600' },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.cardB },
  msgInput:        { flex: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.cardB, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.white, maxHeight: 100 },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  sendIcon:        { fontSize: 18, color: C.white },
});