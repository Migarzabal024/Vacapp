import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, isLoading } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { Alert.alert('Error', 'Completá todos los campos.'); return; }
    try {
      await login({ email: email.trim(), password });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Credenciales incorrectas.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1 }} bounces={false} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.header}>
          <View style={styles.logoCircle}><Text style={{ fontSize: 36 }}>🐄</Text></View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.titleTxt, { color: '#fff' }]}>Vac</Text>
            <Text style={[styles.titleTxt, { color: COLORS.primary }]}>App</Text>
          </View>
          <Text style={styles.tagline}>GENÉTICA QUE CRUZA</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Bienvenido de nuevo</Text>
          <Text style={styles.formSub}>Iniciá sesión para continuar</Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputWrap, email ? styles.inputActive : null]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor={COLORS.textSecondary}
              keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrap, password ? styles.inputActive : null]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={!showPass} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={{ marginTop: 20 }} activeOpacity={0.85}>
            <LinearGradient colors={['#4EBA2E', '#1E3D2B']} style={styles.cta}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaTxt}>Iniciar sesión  →</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerTxt}>¿No tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registrate gratis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:      { paddingTop: 72, paddingBottom: 40, alignItems: 'center', gap: 10 },
  logoCircle:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(78,186,46,0.2)', alignItems: 'center', justifyContent: 'center' },
  titleTxt:    { fontSize: 30, fontWeight: '800' },
  tagline:     { color: COLORS.olive, fontSize: 10, letterSpacing: 3 },
  form:        { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, flex: 1 },
  formTitle:   { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  formSub:     { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24 },
  label:       { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6, marginTop: 12 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: 'transparent', gap: 10 },
  inputActive: { borderColor: COLORS.primary },
  inputIcon:   { fontSize: 16 },
  input:       { flex: 1, fontSize: 14, color: COLORS.textLight },
  cta:         { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaTxt:      { color: '#fff', fontWeight: '600', fontSize: 15 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerTxt: { fontSize: 13, color: COLORS.textSecondary },
  registerLink:{ fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
