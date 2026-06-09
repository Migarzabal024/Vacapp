import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants';

const SLIDES = [
  { icon: '🧬', title: 'Genética que Cruza', sub: 'MEJORA QUE SE VE', body: 'Accedé a los mejores reproductores del país con datos genéticos verificados.' },
  { icon: '✅', title: 'KYC & Trazabilidad', sub: 'CONFIANZA GARANTIZADA', body: 'Cada vendedor es verificado con DNI, CUIT y documentación.' },
  { icon: '📱', title: 'Cierre In Situ', sub: 'QR ÚNICO EN EL CAMPO', body: 'Código QR único para confirmar la transacción en el momento de la entrega.' },
];

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [current, setCurrent] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const isLast = current === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) { navigation.replace('Login'); return; }
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrent(c => c + 1);
  };

  const slide = SLIDES[current];

  return (
    <LinearGradient colors={['#0A1E16', '#1E3D2B']} style={styles.container}>
      {!isLast && (
        <TouchableOpacity style={styles.skip} onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipTxt}>Saltar</Text>
        </TouchableOpacity>
      )}
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <View style={styles.iconCircle}><Text style={styles.icon}>{slide.icon}</Text></View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.sub}>{slide.sub}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </Animated.View>
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
              <View style={[styles.dot, { width: i === current ? 24 : 8, backgroundColor: i === current ? COLORS.primary : 'rgba(255,255,255,0.3)' }]} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.cta} onPress={goNext}>
          <Text style={styles.ctaTxt}>{isLast ? 'Empezar ahora' : 'Continuar'} →</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, paddingTop: 60 },
  skip:       { position: 'absolute', top: 60, right: 24 },
  skipTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  content:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(78,186,46,0.15)', borderWidth: 2, borderColor: 'rgba(78,186,46,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  icon:       { fontSize: 56 },
  title:      { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  sub:        { color: COLORS.primary, fontSize: 11, letterSpacing: 2, marginBottom: 20 },
  body:       { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  bottom:     { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center', gap: 20 },
  dots:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot:        { height: 8, borderRadius: 4 },
  cta:        { width: '100%', height: 56, backgroundColor: COLORS.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaTxt:     { color: '#fff', fontWeight: '600', fontSize: 16 },
});
