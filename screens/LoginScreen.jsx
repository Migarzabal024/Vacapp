import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';

const C = {
  bgTop:'#0D2818', bgCard:'#FFFFFF', green:'#2E7D3C', lGreen:'#43D854',
  dark:'#1A1A1A', muted:'#888888', inputBg:'#F5F5F5', border:'#E0E0E0',
  iconC:'#AAAAAA', white:'#FFFFFF', tagline:'#A0C4A8', link:'#2E7D3C',
  admin:'#999999', divider:'#AAAAAA',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [show, setShow]   = useState(false);

  const handleLogin = () => {
    // Navega al Home (cualquier email/pass por ahora)
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bgTop} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.iconBg}><Text style={s.iconEmoji}>🐄</Text></View>
          <View style={s.nameRow}>
            <Text style={s.vac}>Vac</Text><Text style={s.app}>App</Text>
          </View>
          <Text style={s.tagline}>GENÉTICA QUE CRUZA</Text>
          <View style={s.dotsWrap}>
            {Array.from({length:12}).map((_,i)=><View key={i} style={s.dot}/>)}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Bienvenido de nuevo</Text>
          <Text style={s.cardSub}>Iniciá sesión para continuar</Text>

          <Text style={s.label}>Correo electrónico</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>✉️</Text>
            <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={C.iconC}
              keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
          </View>

          <Text style={s.label}>Contraseña</Text>
          <View style={s.inputWrap}>
            <Text style={s.iIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={C.iconC}
              secureTextEntry={!show} value={pass} onChangeText={setPass}/>
            <TouchableOpacity onPress={()=>setShow(!show)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{show?'🙈':'👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.forgotRow}>
            <Text style={s.forgotTxt}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={s.loginBtnTxt}>Iniciar sesión →</Text>
          </TouchableOpacity>

          <View style={s.divRow}>
            <View style={s.divLine}/><Text style={s.divTxt}>o continuá con</Text><View style={s.divLine}/>
          </View>

          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} onPress={handleLogin}>
              <Text style={[s.socialIcon,{color:'#DB4437'}]}>G</Text>
              <Text style={s.socialTxt}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} onPress={handleLogin}>
              <Text style={[s.socialIcon,{color:'#1877F2'}]}>f</Text>
              <Text style={s.socialTxt}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.registerRow}>
            <Text style={s.registerTxt}>¿No tenés cuenta? <Text style={s.registerLink}>Registrate gratis</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>navigation.navigate('AdminLogin')} style={s.adminRow}>
            <Text style={s.adminTxt}>🔐 Acceso Administrador</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bgTop},
  scroll:{flexGrow:1},
  header:{backgroundColor:C.bgTop,alignItems:'center',paddingTop:60,paddingBottom:32,overflow:'hidden',position:'relative'},
  iconBg:{width:64,height:64,borderRadius:18,backgroundColor:C.lGreen,alignItems:'center',justifyContent:'center',marginBottom:10},
  iconEmoji:{fontSize:34},
  nameRow:{flexDirection:'row'},
  vac:{fontSize:28,fontWeight:'700',color:'#FFF'},
  app:{fontSize:28,fontWeight:'700',color:C.lGreen},
  tagline:{fontSize:10,color:C.tagline,letterSpacing:2.5,marginTop:4},
  dotsWrap:{position:'absolute',right:12,top:40,flexDirection:'row',flexWrap:'wrap',width:56,gap:6},
  dot:{width:5,height:5,borderRadius:2.5,backgroundColor:'#1F5C30'},
  card:{flex:1,backgroundColor:C.bgCard,borderTopLeftRadius:28,borderTopRightRadius:28,paddingHorizontal:24,paddingTop:32,paddingBottom:40},
  cardTitle:{fontSize:24,fontWeight:'700',color:C.dark,marginBottom:4},
  cardSub:{fontSize:14,color:C.muted,marginBottom:28},
  label:{fontSize:13,fontWeight:'600',color:C.dark,marginBottom:6},
  inputWrap:{flexDirection:'row',alignItems:'center',backgroundColor:C.inputBg,borderRadius:12,borderWidth:1,borderColor:C.border,paddingHorizontal:14,marginBottom:16,height:50},
  iIcon:{fontSize:16,marginRight:10},
  input:{flex:1,fontSize:15,color:C.dark,height:'100%'},
  eyeBtn:{padding:4},
  eyeIcon:{fontSize:16},
  forgotRow:{alignSelf:'flex-end',marginBottom:20},
  forgotTxt:{fontSize:13,color:C.green,fontWeight:'500'},
  loginBtn:{backgroundColor:C.green,borderRadius:14,height:52,alignItems:'center',justifyContent:'center',marginBottom:24},
  loginBtnTxt:{color:'#FFF',fontSize:16,fontWeight:'700'},
  divRow:{flexDirection:'row',alignItems:'center',marginBottom:20,gap:10},
  divLine:{flex:1,height:1,backgroundColor:C.border},
  divTxt:{fontSize:12,color:C.divider},
  socialRow:{flexDirection:'row',gap:12,marginBottom:24},
  socialBtn:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,height:46,backgroundColor:'#F8F8F8',borderWidth:1,borderColor:C.border,borderRadius:12},
  socialIcon:{fontSize:16,fontWeight:'700'},
  socialTxt:{fontSize:14,color:'#333',fontWeight:'500'},
  registerRow:{alignItems:'center',marginBottom:16},
  registerTxt:{fontSize:14,color:C.muted},
  registerLink:{color:C.link,fontWeight:'600'},
  adminRow:{alignItems:'center',opacity:0.6},
  adminTxt:{fontSize:12,color:C.admin},
});
