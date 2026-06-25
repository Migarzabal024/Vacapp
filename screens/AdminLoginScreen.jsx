import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', card:'#122E1C', cardB:'#1F5C30', green:'#4CAF50', lGreen:'#43D854', white:'#FFFFFF', muted:'#7AB88A', inputBg:'#1A3D24', inputB:'#2A5A34', inputPh:'#5A8A68' };

export default function AdminLoginScreen({ navigation }) {
  const { signInAdmin } = useAuth();
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) { Alert.alert('Error','Completá email y contraseña'); return; }
    setLoading(true);
    try {
      await signInAdmin({ email, password: pass });
      navigation.replace('AdminPanel');
    } catch (e) {
      Alert.alert('Acceso denegado', e.message.includes('permisos')
        ? 'Esta cuenta no tiene permisos de administrador'
        : 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoSec}>
          <View style={s.iconBg}><Text style={s.iconEmoji}>🐄</Text></View>
          <View style={s.nameRow}><Text style={s.vac}>Vac</Text><Text style={s.app}>App</Text></View>
          <View style={s.badge}><Text style={s.badgeTxt}>PANEL ADMINISTRADOR</Text></View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Acceso Restringido</Text>
          <Text style={s.cardSub}>Solo para administradores del sistema</Text>

          <Text style={s.label}>Correo electrónico</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>✉️</Text>
            <TextInput style={s.input} placeholder="admin@vacapp.com" placeholderTextColor={C.inputPh} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
          </View>

          <Text style={s.label}>Contraseña</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="Contraseña" placeholderTextColor={C.inputPh} secureTextEntry={!show} value={pass} onChangeText={setPass}/>
            <TouchableOpacity onPress={()=>setShow(!show)}><Text style={{fontSize:16}}>{show?'🙈':'👁️'}</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.loginBtn, loading&&{opacity:0.7}]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#FFF"/> : <Text style={s.loginBtnTxt}>→  Iniciar Sesión como Administrador</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.backRow} onPress={()=>navigation.goBack()}>
          <Text style={s.backTxt}>← Volver al inicio de sesión normal</Text>
        </TouchableOpacity>
        <View style={s.secRow}><Text style={s.secTxt}>🔐 Acceso seguro · Solo personal autorizado</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  scroll:{flexGrow:1,alignItems:'center',paddingHorizontal:24,paddingTop:64,paddingBottom:40},
  logoSec:{alignItems:'center',marginBottom:32},
  iconBg:{width:68,height:68,borderRadius:18,backgroundColor:C.green,alignItems:'center',justifyContent:'center',marginBottom:10},
  iconEmoji:{fontSize:36},
  nameRow:{flexDirection:'row'},
  vac:{fontSize:28,fontWeight:'700',color:C.white},
  app:{fontSize:28,fontWeight:'700',color:C.lGreen},
  badge:{marginTop:10,borderWidth:1,borderColor:'#2A5A34',borderRadius:20,paddingHorizontal:16,paddingVertical:5,backgroundColor:'#0A2010'},
  badgeTxt:{fontSize:10,color:C.muted,letterSpacing:2,fontWeight:'600'},
  card:{width:'100%',backgroundColor:C.card,borderRadius:20,borderWidth:1,borderColor:C.cardB,padding:24,marginBottom:24},
  cardTitle:{fontSize:22,fontWeight:'700',color:C.white,marginBottom:4},
  cardSub:{fontSize:13,color:C.muted,marginBottom:24},
  label:{fontSize:13,color:C.muted,marginBottom:6,fontWeight:'500'},
  inputWrap:{flexDirection:'row',alignItems:'center',backgroundColor:C.inputBg,borderRadius:12,borderWidth:1,borderColor:C.inputB,paddingHorizontal:14,marginBottom:16,height:50},
  iIcon:{fontSize:16,marginRight:10},
  input:{flex:1,fontSize:15,color:C.white,height:'100%'},
  loginBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:C.green,borderRadius:14,height:56,marginTop:8},
  loginBtnTxt:{color:C.white,fontSize:15,fontWeight:'700'},
  backRow:{marginBottom:16},
  backTxt:{fontSize:13,color:C.muted},
  secRow:{opacity:0.5},
  secTxt:{fontSize:11,color:C.muted},
});
