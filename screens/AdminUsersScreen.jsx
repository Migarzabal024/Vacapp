import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Modal } from 'react-native';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', dark:'#1A2E1A', orange:'#FF9800', red:'#E53935' };

const USERS = [
  { id:1, name:'Carlos Méndez',   initials:'CM', email:'c.mendez@mail.com',      date:'12 Ene 2026', status:'Verificado', statusColor:C.green },
  { id:2, name:'Luciana Torres',  initials:'LT', email:'lu.torres@mail.com',     date:'3 Mar 2026',  status:'Pendiente',  statusColor:C.orange },
  { id:3, name:'Roberto Aguirre', initials:'RA', email:'r.aguirre@campo.com',    date:'20 Mar 2026', status:'Pendiente',  statusColor:C.orange },
  { id:4, name:'Martina López',   initials:'ML', email:'m.lopez@mail.com',       date:'5 Feb 2026',  status:'Rechazado',  statusColor:C.red },
  { id:5, name:'Jorge Villanueva',initials:'JV', email:'j.villanueva@campo.com', date:'15 Ene 2026', status:'Verificado', statusColor:C.green },
];

const FILTERS = ['Todos','Pendiente','Verificado','Rechazado'];

export default function AdminUsersScreen({ navigation }) {
  const [filter, setFilter]   = useState('Todos');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = USERS.filter(u => {
    const matchFilter = filter==='Todos' || u.status===filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <Text style={s.title}>Usuarios & KYC</Text>
        <Text style={s.subtitle}>3 verificaciones pendientes</Text>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Buscar usuario o email..." placeholderTextColor={C.muted} value={search} onChangeText={setSearch}/>
      </View>

      <View style={s.filtersRow}>
        {FILTERS.map(f=>(
          <TouchableOpacity key={f} style={[s.filterChip, filter===f && s.filterChipActive]} onPress={()=>setFilter(f)}>
            <Text style={[s.filterTxt, filter===f && s.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {filtered.map(u=>(
          <View key={u.id} style={s.userCard}>
            <View style={s.userLeft}>
              <View style={s.userAvatar}><Text style={s.userInitials}>{u.initials}</Text></View>
              <View style={s.userInfo}>
                <Text style={s.userName}>{u.name}</Text>
                <Text style={s.userEmail}>{u.email}</Text>
                <Text style={s.userDate}>{u.date}</Text>
              </View>
            </View>
            <View style={s.userRight}>
              <View style={[s.statusBadge,{backgroundColor:u.statusColor+'22'}]}>
                <Text style={[s.statusTxt,{color:u.statusColor}]}>{u.status}</Text>
              </View>
              <TouchableOpacity style={s.kycBtn} onPress={()=>setSelected(u)}>
                <Text style={s.kycBtnTxt}>Ver KYC</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal KYC */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={()=>setSelected(null)}>
        <View style={m.overlay}>
          <View style={m.modal}>
            <View style={m.modalHeader}>
              <Text style={m.modalTitle}>Documentación KYC</Text>
              <TouchableOpacity onPress={()=>setSelected(null)}><Text style={m.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            {selected && <>
              <View style={m.userRow}>
                <View style={m.userAvatar}><Text style={m.userInitials}>{selected.initials}</Text></View>
                <View style={m.userInfo}>
                  <Text style={m.userName}>{selected.name}</Text>
                  <Text style={m.userEmail}>{selected.email}</Text>
                </View>
                <View style={[m.statusBadge,{backgroundColor:selected.statusColor+'22'}]}>
                  <Text style={[m.statusTxt,{color:selected.statusColor}]}>{selected.status}</Text>
                </View>
              </View>

              <View style={m.docCard}>
                <View style={m.docHeader}><Text style={m.docIcon}>💳</Text><Text style={m.docTitle}>Documento de Identidad</Text></View>
                <View style={m.docRow}><Text style={m.docLabel}>DNI</Text><Text style={m.docVal}>28.430.112</Text></View>
                <View style={m.docRow}><Text style={m.docLabel}>Ubicación</Text><Text style={m.docVal}>Córdoba, AR</Text></View>
                <View style={m.docRow}><Text style={m.docLabel}>Registro</Text><Text style={m.docVal}>12 Ene 2026</Text></View>
              </View>

              <View style={m.photoPlaceholder}>
                <Text style={m.photoIcon}>🖼️</Text>
                <Text style={m.photoTxt}>Foto del DNI (anverso)</Text>
              </View>

              {selected.status==='Pendiente' && (
                <View style={m.actions}>
                  <TouchableOpacity style={m.rejectBtn} onPress={()=>setSelected(null)}>
                    <Text style={m.rejectTxt}>Rechazar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={m.approveBtn} onPress={()=>setSelected(null)}>
                    <Text style={m.approveTxt}>Verificar ✓</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  header:{paddingHorizontal:20,paddingTop:52,paddingBottom:16},
  title:{fontSize:24,fontWeight:'700',color:C.white},
  subtitle:{fontSize:13,color:C.muted,marginTop:2},
  searchWrap:{flexDirection:'row',alignItems:'center',backgroundColor:C.card,borderRadius:14,marginHorizontal:20,paddingHorizontal:14,height:46,gap:10,borderWidth:1,borderColor:C.cardB,marginBottom:12},
  searchIcon:{fontSize:16},
  searchInput:{flex:1,fontSize:14,color:C.white},
  filtersRow:{flexDirection:'row',gap:8,paddingHorizontal:20,marginBottom:16},
  filterChip:{paddingHorizontal:14,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:C.cardB,backgroundColor:C.card},
  filterChipActive:{backgroundColor:C.green,borderColor:C.green},
  filterTxt:{fontSize:12,color:C.muted,fontWeight:'500'},
  filterTxtActive:{color:C.white},
  scroll:{paddingHorizontal:20,paddingBottom:100,gap:10},
  userCard:{backgroundColor:C.card,borderRadius:16,padding:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:C.cardB},
  userLeft:{flexDirection:'row',gap:12,alignItems:'center',flex:1},
  userAvatar:{width:44,height:44,borderRadius:22,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  userInitials:{fontSize:16,fontWeight:'700',color:C.white},
  userInfo:{flex:1},
  userName:{fontSize:14,fontWeight:'700',color:C.white},
  userEmail:{fontSize:12,color:C.muted,marginTop:1},
  userDate:{fontSize:11,color:C.muted,marginTop:1},
  userRight:{alignItems:'flex-end',gap:8},
  statusBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:10},
  statusTxt:{fontSize:11,fontWeight:'700'},
  kycBtn:{backgroundColor:C.cardB,borderRadius:10,paddingHorizontal:12,paddingVertical:6},
  kycBtnTxt:{fontSize:12,color:C.white,fontWeight:'600'},
});

const m = StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},
  modal:{backgroundColor:'#1A3D24',borderTopLeftRadius:24,borderTopRightRadius:24,padding:24,paddingBottom:40},
  modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  modalTitle:{fontSize:18,fontWeight:'700',color:C.white},
  closeBtn:{fontSize:20,color:C.muted,padding:4},
  userRow:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16},
  userAvatar:{width:48,height:48,borderRadius:24,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  userInitials:{fontSize:18,fontWeight:'700',color:C.white},
  userInfo:{flex:1},
  userName:{fontSize:15,fontWeight:'700',color:C.white},
  userEmail:{fontSize:12,color:C.muted},
  statusBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:10},
  statusTxt:{fontSize:12,fontWeight:'700'},
  docCard:{backgroundColor:C.card,borderRadius:14,padding:16,marginBottom:12,borderWidth:1,borderColor:C.cardB},
  docHeader:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
  docIcon:{fontSize:18},
  docTitle:{fontSize:13,fontWeight:'600',color:C.muted},
  docRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:6,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.05)'},
  docLabel:{fontSize:13,color:C.muted},
  docVal:{fontSize:13,color:C.white,fontWeight:'600'},
  photoPlaceholder:{height:80,backgroundColor:C.card,borderRadius:12,borderWidth:1,borderColor:C.cardB,alignItems:'center',justifyContent:'center',gap:6,marginBottom:16},
  photoIcon:{fontSize:24,color:C.muted},
  photoTxt:{fontSize:12,color:C.muted},
  actions:{flexDirection:'row',gap:12},
  rejectBtn:{flex:1,height:46,borderRadius:12,borderWidth:1,borderColor:C.red,alignItems:'center',justifyContent:'center'},
  rejectTxt:{fontSize:14,color:C.red,fontWeight:'600'},
  approveBtn:{flex:1,height:46,borderRadius:12,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  approveTxt:{fontSize:14,color:C.white,fontWeight:'700'},
});
