import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', red:'#E53935' };

const MENU = [
  { icon:'✏️', label:'Editar perfil', chevron:true },
  { icon:'📖', label:'Mis publicaciones', chevron:true },
  { icon:'🛡️', label:'Verificación KYC', chevron:true, badge:'Verificado', badgeColor:C.green },
  { icon:'🔔', label:'Notificaciones', chevron:true },
  { icon:'❤️', label:'Animales favoritos', chevron:true },
  { icon:'💵', label:'Historial de transacciones', chevron:true },
  { icon:'⚙️', label:'Configuración', chevron:true },
];

export default function ProfileScreen({ navigation }) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mi Perfil</Text>
        </View>

        {/* Avatar + info */}
        <View style={s.profileSection}>
          <View style={s.avatar}><Text style={s.avatarEmoji}>🐄</Text></View>
          <View style={s.profileInfo}>
            <View style={s.nameRow}>
              <Text style={s.name}>martin</Text>
              <View style={s.onlineDot}/>
            </View>
            <Text style={s.rating}>⭐ 4.8  <Text style={s.reviews}>(12 reseñas)</Text></Text>
            <Text style={s.role}>Productor · Miembro desde 2024</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statIcon}>💵</Text>
            <Text style={s.statNum}>3</Text>
            <Text style={s.statLabel}>Compras</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statIcon}>📈</Text>
            <Text style={s.statNum}>0</Text>
            <Text style={s.statLabel}>Ventas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statIcon}>❤️</Text>
            <Text style={s.statNum}>12</Text>
            <Text style={s.statLabel}>Favoritos</Text>
          </View>
        </View>

        {/* Info personal */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Información Personal</Text>
          {[
            { icon:'✉️', label:'Email', val:'juan.gonzalez@email.com' },
            { icon:'📞', label:'Teléfono', val:'+54 9 11 1234-5678' },
            { icon:'📍', label:'Ubicación', val:'Buenos Aires, Argentina' },
            { icon:'📅', label:'Miembro desde', val:'15 de Enero, 2024' },
          ].map((row,i) => (
            <View key={i} style={[s.infoRow, i>0 && s.infoRowBorder]}>
              <View style={s.infoIcon}><Text style={s.infoIconTxt}>{row.icon}</Text></View>
              <View style={s.infoBody}>
                <Text style={s.infoLabel}>{row.label}</Text>
                <Text style={s.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menú */}
        <View style={s.menuCard}>
          {MENU.map((item,i) => (
            <TouchableOpacity key={i} style={[s.menuRow, i>0 && s.menuRowBorder]}
              onPress={()=>{ if(item.label==='Mis publicaciones') navigation.navigate('Publications'); if(item.label==='Historial de transacciones') navigation.navigate('Transactions'); }}>
              <View style={s.menuLeft}>
                <Text style={s.menuIcon}>{item.icon}</Text>
                <Text style={s.menuLabel}>{item.label}</Text>
              </View>
              <View style={s.menuRight}>
                {item.badge && <View style={s.menuBadge}><Text style={s.menuBadgeTxt}>{item.badge}</Text></View>}
                {item.chevron && <Text style={s.menuChevron}>›</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={s.logoutBtn} onPress={()=>navigation.replace('Login')}>
          <Text style={s.logoutIcon}>→</Text>
          <Text style={s.logoutTxt}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#F5F7F5'},
  scroll:{paddingBottom:100},
  header:{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,paddingHorizontal:16,paddingTop:52,paddingBottom:16,gap:12},
  backBtn:{width:36,height:36,borderRadius:12,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center'},
  backIcon:{fontSize:22,color:C.white,fontWeight:'300'},
  headerTitle:{fontSize:20,fontWeight:'700',color:C.white},
  profileSection:{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,paddingHorizontal:20,paddingBottom:20,gap:16},
  avatar:{width:64,height:64,borderRadius:16,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  avatarEmoji:{fontSize:36},
  profileInfo:{flex:1},
  nameRow:{flexDirection:'row',alignItems:'center',gap:8},
  name:{fontSize:20,fontWeight:'700',color:C.white},
  onlineDot:{width:10,height:10,borderRadius:5,backgroundColor:C.lGreen},
  rating:{fontSize:14,color:'#FFD700',marginTop:4},
  reviews:{color:C.muted,fontWeight:'400'},
  role:{fontSize:12,color:C.muted,marginTop:2},
  statsRow:{flexDirection:'row',gap:10,padding:16,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border},
  statCard:{flex:1,alignItems:'center',gap:4},
  statIcon:{fontSize:20},
  statNum:{fontSize:18,fontWeight:'700',color:C.dark},
  statLabel:{fontSize:11,color:C.gray},
  infoCard:{backgroundColor:C.white,marginHorizontal:16,marginTop:16,borderRadius:16,padding:16,shadowColor:'#000',shadowOpacity:0.04,shadowRadius:4,elevation:2},
  infoTitle:{fontSize:16,fontWeight:'700',color:C.dark,marginBottom:14},
  infoRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:10},
  infoRowBorder:{borderTopWidth:1,borderTopColor:'#F5F5F5'},
  infoIcon:{width:36,height:36,borderRadius:10,backgroundColor:'#F0F7F0',alignItems:'center',justifyContent:'center'},
  infoIconTxt:{fontSize:18},
  infoBody:{flex:1},
  infoLabel:{fontSize:11,color:C.gray},
  infoVal:{fontSize:14,color:C.dark,fontWeight:'500',marginTop:1},
  menuCard:{backgroundColor:C.white,marginHorizontal:16,marginTop:12,borderRadius:16,overflow:'hidden',shadowColor:'#000',shadowOpacity:0.04,shadowRadius:4,elevation:2},
  menuRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16},
  menuRowBorder:{borderTopWidth:1,borderTopColor:'#F5F5F5'},
  menuLeft:{flexDirection:'row',alignItems:'center',gap:12},
  menuIcon:{fontSize:20,width:28},
  menuLabel:{fontSize:15,color:C.dark,fontWeight:'500'},
  menuRight:{flexDirection:'row',alignItems:'center',gap:8},
  menuBadge:{backgroundColor:'#E8F5E9',paddingHorizontal:10,paddingVertical:3,borderRadius:10},
  menuBadgeTxt:{fontSize:12,color:C.green,fontWeight:'600'},
  menuChevron:{fontSize:20,color:'#CCC'},
  logoutBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginHorizontal:16,marginTop:12,backgroundColor:'#FFF0F0',borderRadius:16,padding:16,borderWidth:1,borderColor:'#FFCCCC'},
  logoutIcon:{fontSize:16,color:C.red},
  logoutTxt:{fontSize:15,color:C.red,fontWeight:'600'},
});
