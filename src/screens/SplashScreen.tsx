import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants';

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const logoScale   = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(logoScale,   { toValue: 1, friction: 5,  useNativeDriver: true }),
    ]).start();

    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.timing(dot, { toValue: 1,   duration: 400, delay, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 400,        useNativeDriver: true }),
      ]));
    pulse(dot1, 0).start();
    pulse(dot2, 250).start();
    pulse(dot3, 500).start();

    const timer = setTimeout(() => navigation.replace('Onboarding'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0A1E16', '#1E3D2B', '#0A1E16']} style={styles.container}>
      <Animated.View style={[styles.logoArea, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <LinearGradient colors={['#4EBA2E', '#1E3D2B']} style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🐄</Text>
        </LinearGradient>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: '#fff' }]}>Vac</Text>
          <Text style={[styles.title, { color: COLORS.primary }]}>App</Text>
        </View>
        <Text style={styles.tagline}>GENÉTICA QUE CRUZA</Text>
      </Animated.View>

      <Text style={{ fontSize: 80 }}>🐄</Text>

      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 60 },
  logoArea:   { alignItems: 'center', gap: 12 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  logoEmoji:  { fontSize: 48 },
  titleRow:   { flexDirection: 'row' },
  title:      { fontSize: 46, fontWeight: '800' },
  tagline:    { color: COLORS.olive, fontSize: 11, letterSpacing: 3 },
  dotsRow:    { flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
