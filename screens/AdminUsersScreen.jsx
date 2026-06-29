import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Modal, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', dark:'#1A2E1A', orange:'#FF9800', red:'#E53935' };

const FILTERS = ['Todos','Pendiente','Verificado','Rechazado'];

const getUIStatus = (dbStatus) => {
  if (dbStatus === 'verified' || dbStatus === 'Verificado') return 'Verificado';
  if (dbStatus === 'rejected' || dbStatus === 'Rechazado' || dbStatus === 'blocked') return 'Rechazado';
  return 'Pendiente';
};

const getStatusColor = (uiStatus) => {
  if (uiStatus === 'Verificado') return C.green;
  if (uiStatus === 'Rechazado') return C.red;
  return C.orange;
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function AdminUsersScreen({ navigation }) {
  const [filter, setFilter]     = useState('Todos');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [usersDB, setUsersDB]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsersDB(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ◄ LOGICA DE BOTONES MEJORADA CON ALERTAS DETALLADAS DE ERROR
   const handleUpdateStatus = async (userId, newStatus) => {
       try {
         const { error } = await supabase
           .from('profiles')
           .update({
             kyc_status: newStatus // ◄ ¡ESTA ES LA ÚNICA COLUMNA QUE DEBE QUEDAR!
           })
           .eq('id', userId);

         if (error) {
           Alert.alert('Error de Base de Datos', error.message);
           return;
         }

         Alert.alert('¡Éxito!', `Usuario actualizado correctamente.`);
         setSelected(null);
         fetchUsers();
       } catch (error) {
         console.error('Error de red:', error);
         Alert.alert('Error', 'No se pudo conectar con el servidor.');
       }
     };

  const mappedUsers = usersDB.map(u => {
    const uiStatus = getUIStatus(u.status || u.kyc_status);
    const fullName = u.full_name || u.name || 'Usuario sin nombre';
    return {
      ...u,
      name: fullName,
      initials: getInitials(fullName),
      email: u.email || 'Sin email',
      date: u.created_at ? new Date(u.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' }) : '—',
      status: uiStatus,
      statusColor: getStatusColor(uiStatus)
    };
  });

  const filtered = mappedUsers.filter(u => {
    const matchFilter = filter === 'Todos' || u.status === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendientesCount = mappedUsers.filter(u => u.status === 'Pendiente').length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <Text style={s.title}>Usuarios & KYC</Text>
        <Text style={s.subtitle}>{pendientesCount} verificaciones pendientes</Text>
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

      {loading ? (
        <ActivityIndicator size="large" color={C.green} style={{ marginTop: 40 }} />
      ) : (
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
          {filtered.length === 0 && (
            <Text style={{ textAlign: 'center', color: C.muted, marginTop: 20 }}>No hay usuarios para mostrar.</Text>
          )}
        </ScrollView>
      )}

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
                {selected.kyc_dni && <View style={m.docRow}><Text style={m.docLabel}>DNI</Text><Text style={m.docVal}>{selected.kyc_dni}</Text></View>}
                <View style={m.docRow}><Text style={m.docLabel}>Ubicación</Text><Text style={m.docVal}>{selected.location || 'No especificada'}</Text></View>
                <View style={m.docRow}><Text style={m.docLabel}>Registro</Text><Text style={m.docVal}>{selected.date}</Text></View>
              </View>

              <View style={m.photoPlaceholder}>
                <Text style={m.photoIcon}>🖼️</Text>
                <Text style={m.photoTxt}>Foto del DNI (anverso)</Text>
              </View>

              {/* Botones de acción siempre disponibles para el Admin */}
              <View style={m.actions}>
                <TouchableOpacity style={m.rejectBtn} onPress={()=>handleUpdateStatus(selected.id, 'rejected')}>
                  <Text style={m.rejectTxt}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={m.approveBtn} onPress={()=>handleUpdateStatus(selected.id, 'verified')}>
                  <Text style={m.approveTxt}>Verificar ✓</Text>
                </TouchableOpacity>
              </View>
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