import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

const STEPS = ['Datos personales', 'Datos fiscales', 'Seguridad'];

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    nombre: '', email: '', dni: '', cuit_cuil: '',
    rol: 'productor' as UserRole, password: '', confirm: '',
  });
  const set = (f: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [f]: v }));

  const next = async () => {
    if (step < 2) { setStep(s => s + 1); return; }
    if (form.password !== form.confirm) { Alert.alert('Error', 'Las contraseñas no coinciden.'); return; }
    try {
      await register({ nombre_completo: form.nombre, email: form.email, password: form.password, dni: form.dni, cuit_cuil: form.cuit_cuil, rol: form.rol });
      setDone(true);
      setTimeout(() => {}, 2000);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la cuenta.');
    }
  };

  if (done) return (
    <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48 }}>✓</Text>
      </View>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>¡Bienvenido a VacApp!</Text>
      <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 40 }}>Tu cuenta fue creada exitosamente.</Text>
    </LinearGradient>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => step === 0 ? navigation.goBack() : setStep(s => s - 1)} style={styles.backBtn}>
              <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Crear cuenta</Text>
              <Text style={styles.headerSub}>Paso {step + 1} de 3</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STEPS.map((_, i) => (
              <View key={i} style={{ flex: 1, height: 5, borderRadius: 4, backgroundColor: i <= step ? COLORS.primary : 'rgba(255,255,255,0.2)' }} />
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {step === 0 && (
            <>
              <Text style={styles.stepTitle}>Tus datos personales</Text>
              <Field label="Nombre completo" value={form.nombre} onChange={set('nombre')} placeholder="Ej: Juan María González" />
              <Field label="Correo electrónico" value={form.email} onChange={set('email')} placeholder="tu@email.com" keyboardType="email-address" />
            </>
          )}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Datos fiscales</Text>
              <Field label="DNI" value={form.dni} onChange={set('dni')} placeholder="Ej: 35.123.456" keyboardType="numeric" />
              <Field label="CUIT / CUIL" value={form.cuit_cuil} onChange={set('cuit_cuil')} placeholder="Ej: 20-35123456-7" keyboardType="numeric" />
              <Text style={styles.label}>Rol en la plataforma</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {(['productor', 'admin'] as UserRole[]).map(r => (
                  <TouchableOpacity key={r} onPress={() => setForm(f => ({ ...f, rol: r }))}
                    style={[styles.roleBtn, form.rol === r && styles.roleBtnActive]}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: form.rol === r ? COLORS.primaryDark : COLORS.textSecondary }}>
                      {r === 'productor' ? '🐄 Productor' : '⚙️ Admin'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Creá tu contraseña</Text>
              <Field label="Contraseña" value={form.password} onChange={set('password')} placeholder="Mínimo 8 caracteres" secureTextEntry />
              <Field label="Confirmar contraseña" value={form.confirm} onChange={set('confirm')} placeholder="Repetí tu contraseña" secureTextEntry />
            </>
          )}

          <TouchableOpacity onPress={next} disabled={isLoading} style={{ marginTop: 24 }} activeOpacity={0.85}>
            <LinearGradient colors={['#4EBA2E', '#1E3D2B']} style={styles.cta}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaTxt}>{step < 2 ? 'Continuar' : 'Crear cuenta'}</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>¿Ya tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary }}>Iniciá sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType = 'default', secureTextEntry = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any; secureTextEntry?: boolean;
}) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, value ? styles.inputActive : null]}>
        <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={COLORS.textSecondary}
          value={value} onChangeText={onChange} keyboardType={keyboardType}
          secureTextEntry={secureTextEntry} autoCapitalize="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24, gap: 16 },
  headerTop:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub:   { color: COLORS.olive, fontSize: 11 },
  body:        { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },
  stepTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  label:       { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6, marginTop: 12 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: 'transparent' },
  inputActive: { borderColor: COLORS.primary },
  input:       { flex: 1, fontSize: 14, color: COLORS.textLight },
  roleBtn:     { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  roleBtnActive:{ backgroundColor: COLORS.border, borderColor: COLORS.primary },
  cta:         { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaTxt:      { color: '#fff', fontWeight: '600', fontSize: 15 },
});
