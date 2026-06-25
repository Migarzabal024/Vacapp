import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#2E7D3C', lGreen:'#43D854', dark:'#1A1A1A', muted:'#888', inputBg:'#F5F5F5', border:'#E0E0E0', iconC:'#AAAAAA', tagline:'#A0C4A8' };

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [pass2,   setPass2]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !pass) { Alert.alert('Error','Completá todos los campos obligatorios'); return; }
    if (pass.length < 6)          { Alert.alert('Error','La contraseña debe tener al menos 6 caracteres'); return; }
    if (pass !== pass2)           { Alert.alert('Error','Las contraseñas no coinciden'); return; }

    setLoading(true);
    try {
      await signUp({ email, password: pass, fullName: name, phone });
      // ¡Magia! Como apagamos la confirmación por email en Supabase,
      // el usuario se loguea automáticamente al registrarse.
      // Ya no forzamos la navegación, App.js te lleva a MainTabs automáticamente.

    } catch (e) {
      const msg = e.message.includes('already registered')
        ? 'Este email ya está registrado' : e.message;
      Alert.alert('Error al registrarse', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={s.logoRow}>
            <View style={s.iconBg}><Text style={s.iconEmoji}>🐄</Text></View>
            <View style={s.nameRow}><Text style={s.vac}>Vac</Text><Text style={s.app}>App</Text></View>
            <Text style={s.tagline}>GENÉTICA QUE CRUZA</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Crear cuenta</Text>
          <Text style={s.cardSub}>Registrate gratis y empezá a operar</Text>

          <Text style={s.label}>Nombre completo *</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>👤</Text>
            <TextInput style={s.input} placeholder="Ej: Juan González" placeholderTextColor={C.iconC} value={name} onChangeText={setName}/>
          </View>

          <Text style={s.label}>Correo electrónico *</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>✉️</Text>
            <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={C.iconC} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
          </View>

          <Text style={s.label}>Teléfono</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>📞</Text>
            <TextInput style={s.input} placeholder="+54 9 11 1234-5678" placeholderTextColor={C.iconC} keyboardType="phone-pad" value={phone} onChangeText={setPhone}/>
          </View>

          <Text style={s.label}>Contraseña * (mínimo 6 caracteres)</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="Mínimo 6 caracteres" placeholderTextColor={C.iconC} secureTextEntry={!show} value={pass} onChangeText={setPass}/>
            <TouchableOpacity onPress={()=>setShow(!show)}><Text style={{fontSize:16}}>{show?'🙈':'👁️'}</Text></TouchableOpacity>
          </View>

          <Text style={s.label}>Repetir contraseña *</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="Repetí tu contraseña" placeholderTextColor={C.iconC} secureTextEntry={!show} value={pass2} onChangeText={setPass2}/>
          </View>

          <TouchableOpacity style={[s.registerBtn, loading&&{opacity:0.7}]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#FFF"/> : <Text style={s.registerBtnTxt}>Crear cuenta gratis →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>navigation.goBack()} style={s.loginRow}>
            <Text style={s.loginTxt}>¿Ya tenés cuenta? <Text style={s.loginLink}>Iniciar sesión</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  scroll:{flexGrow:1},
  header:{backgroundColor:C.bg,paddingTop:52,paddingBottom:24,paddingHorizontal:16},
  backBtn:{width:36,height:36,borderRadius:12,backgroundColor:'rgba(255,255,255,0.15)',alignItems:'center',justifyContent:'center',marginBottom:16},
  backIcon:{fontSize:22,color:C.white,fontWeight:'300'},
  logoRow:{alignItems:'center'},
  iconBg:{width:56,height:56,borderRadius:16,backgroundColor:C.lGreen,alignItems:'center',justifyContent:'center',marginBottom:8},
  iconEmoji:{fontSize:30},
  nameRow:{flexDirection:'row'},
  vac:{fontSize:24,fontWeight:'700',color:C.white},
  app:{fontSize:24,fontWeight:'700',color:C.lGreen},
  tagline:{fontSize:10,color:C.tagline,letterSpacing:2,marginTop:4},
  card:{flex:1,backgroundColor:C.white,borderTopLeftRadius:28,borderTopRightRadius:28,paddingHorizontal:24,paddingTop:28,paddingBottom:40},
  cardTitle:{fontSize:22,fontWeight:'700',color:C.dark,marginBottom:4},
  cardSub:{fontSize:14,color:C.muted,marginBottom:24},
  label:{fontSize:13,fontWeight:'600',color:C.dark,marginBottom:6},
  inputWrap:{flexDirection:'row',alignItems:'center',backgroundColor:C.inputBg,borderRadius:12,borderWidth:1,borderColor:C.border,paddingHorizontal:14,marginBottom:14,height:50},
  iIcon:{fontSize:16,marginRight:10},
  input:{flex:1,fontSize:15,color:C.dark,height:'100%'},
  registerBtn:{backgroundColor:C.green,borderRadius:14,height:52,alignItems:'center',justifyContent:'center',marginTop:8,marginBottom:20},
  registerBtnTxt:{color:C.white,fontSize:16,fontWeight:'700'},
  loginRow:{alignItems:'center'},
  loginTxt:{fontSize:14,color:C.muted},
  loginLink:{color:C.green,fontWeight:'600'},
});