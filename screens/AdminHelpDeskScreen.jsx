import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', orange:'#FF9800', red:'#E53935', blue:'#2196F3' };

const URGENCY_COLOR = { Alta:C.red, Media:C.orange, Baja:C.blue };

const TICKETS = [
  { id:1, initials:'ML', name:'Martina López',  subject:'Problema con pago de transacción',     preview:'El pago fue debitado pero la transacción a...', urgency:'Alta',  time:'hace 10 min', resolved:false,
    messages:[
      { from:'user', txt:'Hola, hice un pago de $1.450.000 pero la transacción sigue en estado pendiente. Ya pasó 1 hora.', time:'10:14' },
      { from:'admin', txt:'Hola Martina, voy a revisar el estado de tu transacción ahora mismo.', time:'10:18' },
      { from:'user', txt:'Gracias. El comprobante dice que fue debitado.', time:'10:20' },
    ]},
  { id:2, initials:'LA', name:'Lucas Arrieta',  subject:'No puedo subir fotos de mi DNI',        preview:'Intento cargar las fotos del DNI pero la app...', urgency:'Media', time:'hace 1 h',    resolved:false, messages:[] },
  { id:3, initials:'FG', name:'Felipe Guzmán',  subject:'Publicación eliminada sin aviso',        preview:'Tenía un anuncio de 15 novillos y desapar...', urgency:'Media', time:'hace 2 h',    resolved:false, messages:[] },
  { id:4, initials:'SP', name:'Sandra Pereyra', subject:'Consulta sobre comisión de venta',       preview:'Quería saber cuánto es la comisión que se...', urgency:'Baja',  time:'ayer',         resolved:true,  messages:[] },
];

const FILTERS = ['Todos','Abiertos','Resueltos'];

export default function AdminHelpDeskScreen({ navigation }) {
  const [filter, setFilter]     = useState('Todos');
  const [chatTicket, setChatTicket] = useState(null);
  const [msg, setMsg]           = useState('');
  const [messages, setMessages] = useState(null);

  const openChat = (ticket) => {
    setChatTicket(ticket);
    setMessages([...ticket.messages]);
  };

  const sendMsg = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { from:'admin', txt:msg.trim(), time:'ahora' }]);
    setMsg('');
  };

  const filtered = TICKETS.filter(t => {
    if (filter==='Abiertos')  return !t.resolved;
    if (filter==='Resueltos') return t.resolved;
    return true;
  });

  // Vista de chat
  if (chatTicket) return (
    <View style={ch.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={ch.header}>
        <TouchableOpacity style={ch.backBtn} onPress={()=>setChatTicket(null)}>
          <Text style={ch.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={ch.headerAvatar}><Text style={ch.headerInitials}>{chatTicket.initials}</Text></View>
        <View style={ch.headerInfo}>
          <Text style={ch.headerName}>{chatTicket.name}</Text>
          <Text style={ch.headerSubject}>{chatTicket.subject}</Text>
        </View>
        <View style={[ch.urgencyBadge,{backgroundColor:URGENCY_COLOR[chatTicket.urgency]+'33'}]}>
          <Text style={[ch.urgencyTxt,{color:URGENCY_COLOR[chatTicket.urgency]}]}>{chatTicket.urgency}</Text>
        </View>
      </View>

      <ScrollView style={ch.msgList} contentContainerStyle={{padding:16,gap:12}}>
        {(messages||[]).map((m,i)=>(
          <View key={i} style={[ch.bubble, m.from==='admin' && ch.bubbleAdmin]}>
            <Text style={[ch.bubbleTxt, m.from==='admin' && ch.bubbleTxtAdmin]}>{m.txt}</Text>
            <Text style={[ch.bubbleTime, m.from==='admin' && ch.bubbleTimeAdmin]}>
              {m.from==='admin'?'Tú':'Martina López'} · {m.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={ch.resolveBtn} onPress={()=>setChatTicket(null)}>
        <Text style={ch.resolveTxt}>✓ Marcar como Resuelto</Text>
      </TouchableOpacity>

      <View style={ch.inputRow}>
        <TextInput style={ch.msgInput} placeholder="Escribe un mensaje..." placeholderTextColor={C.muted} value={msg} onChangeText={setMsg} multiline/>
        <TouchableOpacity style={ch.sendBtn} onPress={sendMsg}>
          <Text style={ch.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Vista de lista
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.header}>
        <Text style={s.title}>Help Desk</Text>
        <Text style={s.subtitle}>3 tickets abiertos · 1 urgente</Text>
      </View>

      <View style={s.filtersRow}>
        {FILTERS.map(f=>(
          <TouchableOpacity key={f} style={[s.filterChip, filter===f && s.filterChipActive]} onPress={()=>setFilter(f)}>
            <Text style={[s.filterTxt, filter===f && s.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {filtered.map(t=>(
          <TouchableOpacity key={t.id} style={[s.ticketCard, t.urgency==='Alta' && s.ticketUrgent]} onPress={()=>openChat(t)} activeOpacity={0.85}>
            <View style={s.ticketLeft}>
              <View style={[s.avatar,{backgroundColor: t.urgency==='Alta'?C.red:t.urgency==='Media'?C.orange:C.blue}]}>
                <Text style={s.avatarTxt}>{t.initials}</Text>
              </View>
              {!t.resolved && <View style={[s.unreadDot,{backgroundColor:URGENCY_COLOR[t.urgency]}]}/>}
            </View>
            <View style={s.ticketBody}>
              <View style={s.ticketTop}>
                <Text style={s.ticketName}>{t.name}</Text>
                <Text style={s.ticketTime}>{t.time}</Text>
              </View>
              <Text style={s.ticketSubject}>{t.subject}</Text>
              <Text style={s.ticketPreview} numberOfLines={1}>{t.preview}</Text>
              <View style={s.ticketTags}>
                <View style={[s.urgencyBadge,{backgroundColor:URGENCY_COLOR[t.urgency]+'22'}]}>
                  <Text style={[s.urgencyTxt,{color:URGENCY_COLOR[t.urgency]}]}>Urgencia: {t.urgency}</Text>
                </View>
                {t.resolved && <View style={s.resolvedBadge}><Text style={s.resolvedTxt}>Resuelto</Text></View>}
              </View>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  header:{paddingHorizontal:20,paddingTop:52,paddingBottom:16},
  title:{fontSize:24,fontWeight:'700',color:C.white},
  subtitle:{fontSize:13,color:C.muted,marginTop:2},
  filtersRow:{flexDirection:'row',gap:8,paddingHorizontal:20,marginBottom:16},
  filterChip:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:C.cardB,backgroundColor:C.card},
  filterChipActive:{backgroundColor:C.green,borderColor:C.green},
  filterTxt:{fontSize:13,color:C.muted,fontWeight:'500'},
  filterTxtActive:{color:C.white},
  scroll:{paddingHorizontal:20,paddingBottom:100,gap:10},
  ticketCard:{flexDirection:'row',alignItems:'center',backgroundColor:C.card,borderRadius:16,padding:14,gap:12,borderWidth:1,borderColor:C.cardB},
  ticketUrgent:{borderColor:C.red+'44',borderWidth:1.5},
  ticketLeft:{alignItems:'center',gap:4},
  avatar:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'},
  avatarTxt:{fontSize:16,fontWeight:'700',color:C.white},
  unreadDot:{width:8,height:8,borderRadius:4},
  ticketBody:{flex:1},
  ticketTop:{flexDirection:'row',justifyContent:'space-between',marginBottom:2},
  ticketName:{fontSize:14,fontWeight:'700',color:C.white},
  ticketTime:{fontSize:11,color:C.muted},
  ticketSubject:{fontSize:13,color:C.white,marginBottom:2},
  ticketPreview:{fontSize:12,color:C.muted,marginBottom:6},
  ticketTags:{flexDirection:'row',gap:8,flexWrap:'wrap'},
  urgencyBadge:{paddingHorizontal:10,paddingVertical:3,borderRadius:10},
  urgencyTxt:{fontSize:11,fontWeight:'700'},
  resolvedBadge:{paddingHorizontal:10,paddingVertical:3,borderRadius:10,backgroundColor:C.green+'22'},
  resolvedTxt:{fontSize:11,color:C.green,fontWeight:'600'},
  chevron:{fontSize:20,color:C.muted},
});

const ch = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  header:{flexDirection:'row',alignItems:'center',backgroundColor:C.card,paddingHorizontal:16,paddingTop:52,paddingBottom:14,gap:10,borderBottomWidth:1,borderBottomColor:C.cardB},
  backBtn:{width:34,height:34,borderRadius:10,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'},
  backIcon:{fontSize:22,color:C.white,fontWeight:'300'},
  headerAvatar:{width:38,height:38,borderRadius:19,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  headerInitials:{fontSize:14,fontWeight:'700',color:C.white},
  headerInfo:{flex:1},
  headerName:{fontSize:14,fontWeight:'700',color:C.white},
  headerSubject:{fontSize:11,color:C.muted},
  urgencyBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:10},
  urgencyTxt:{fontSize:11,fontWeight:'700'},
  msgList:{flex:1},
  bubble:{backgroundColor:C.card,borderRadius:16,borderBottomLeftRadius:4,padding:12,maxWidth:'80%',alignSelf:'flex-start',borderWidth:1,borderColor:C.cardB},
  bubbleAdmin:{backgroundColor:C.green,borderBottomLeftRadius:16,borderBottomRightRadius:4,alignSelf:'flex-end',borderColor:C.green},
  bubbleTxt:{fontSize:14,color:C.white,lineHeight:20},
  bubbleTxtAdmin:{color:C.white},
  bubbleTime:{fontSize:10,color:C.muted,marginTop:4},
  bubbleTimeAdmin:{color:'rgba(255,255,255,0.7)',textAlign:'right'},
  resolveBtn:{margin:16,backgroundColor:C.card,borderRadius:14,height:46,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.green},
  resolveTxt:{fontSize:14,color:C.lGreen,fontWeight:'600'},
  inputRow:{flexDirection:'row',alignItems:'flex-end',gap:10,paddingHorizontal:16,paddingBottom:24,paddingTop:8,borderTopWidth:1,borderTopColor:C.cardB},
  msgInput:{flex:1,backgroundColor:C.card,borderRadius:14,borderWidth:1,borderColor:C.cardB,paddingHorizontal:14,paddingVertical:10,fontSize:14,color:C.white,maxHeight:100},
  sendBtn:{width:44,height:44,borderRadius:22,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  sendIcon:{fontSize:18,color:C.white},
});
