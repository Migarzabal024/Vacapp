import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const C = {
  bg:      '#0D2818',
  wave1:   '#1A4A28',
  wave2:   '#1F5C30',
  wave3:   '#2E8B3E',
  green:   '#4CAF50',
  lGreen:  '#43D854',
  white:   '#FFFFFF',
  muted:   '#A0C4A8',
};

export default function SplashScreen({ navigation }) {
  const logoOp  = useRef(new Animated.Value(0)).current;
  const logoY   = useRef(new Animated.Value(-20)).current;
  const cowSc   = useRef(new Animated.Value(0.8)).current;
  const cowOp   = useRef(new Animated.Value(0)).current;
  const waveY   = useRef(new Animated.Value(30)).current;
  const dotsOp  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoY,  { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cowSc,  { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(cowOp,  { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(waveY,  { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(dotsOp, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => navigation.replace('Onboarding'), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <Animated.View style={[s.logoWrap, { opacity: logoOp, transform: [{ translateY: logoY }] }]}>
        <View style={s.iconBg}><Text style={s.iconEmoji}>🐄</Text></View>
        <View style={s.nameRow}>
          <Text style={s.vac}>Vac</Text>
          <Text style={s.app}>App</Text>
        </View>
        <Text style={s.tag1}>— GENÉTICA QUE CRUZA —</Text>
        <Text style={s.tag2}>MEJORA QUE SE VE.</Text>
      </Animated.View>

      {/* Helix decorativo */}
      <View style={s.helix}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={s.helixRow}>
            <View style={[s.helixNode, { opacity: 0.5 + i * 0.05 }]} />
            <View style={s.helixLine} />
            <View style={[s.helixNode, { opacity: 0.5 + i * 0.05 }]} />
          </View>
        ))}
      </View>

      <Animated.View style={[s.cow, { opacity: cowOp, transform: [{ scale: cowSc }] }]}>
        <Text style={s.cowEmoji}>🐄</Text>
      </Animated.View>

      <Animated.View style={[s.waves, { transform: [{ translateY: waveY }] }]}>
        <View style={[s.wave, s.w1]} />
        <View style={[s.wave, s.w2]} />
        <View style={[s.wave, s.w3]}>
          <Animated.View style={[s.footer, { opacity: dotsOp }]}>
            <View style={s.dots}>
              {[0,1,2].map(i => (
                <View key={i} style={[s.dot, i===1 && s.dotActive]} />
              ))}
            </View>
            <Text style={s.loading}>Cargando...</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg, alignItems: 'center' },
  logoWrap: { alignItems: 'center', marginTop: height * 0.10, zIndex: 10 },
  iconBg:   { width: 72, height: 72, borderRadius: 20, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  iconEmoji:{ fontSize: 38 },
  nameRow:  { flexDirection: 'row' },
  vac:      { fontSize: 36, fontWeight: '700', color: C.white },
  app:      { fontSize: 36, fontWeight: '700', color: C.lGreen },
  tag1:     { fontSize: 11, color: C.muted, letterSpacing: 2, marginTop: 6 },
  tag2:     { fontSize: 11, color: C.lGreen, letterSpacing: 2, marginTop: 2 },
  helix:    { position: 'absolute', right: 16, top: height * 0.28, gap: 8 },
  helixRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helixNode:{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  helixLine:{ width: 20, height: 1, backgroundColor: C.green, opacity: 0.3 },
  cow:      { position: 'absolute', bottom: height * 0.22, left: width * 0.1 },
  cowEmoji: { fontSize: 90 },
  waves:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.22 },
  wave:     { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 60, borderTopRightRadius: 60 },
  w1:       { height: '90%', backgroundColor: C.wave1 },
  w2:       { height: '75%', backgroundColor: C.wave2, borderTopLeftRadius: 80, borderTopRightRadius: 80 },
  w3:       { height: '55%', backgroundColor: C.wave3, borderTopLeftRadius: 100, borderTopRightRadius: 100, alignItems: 'center', justifyContent: 'center', paddingTop: 12 },
  footer:   { alignItems: 'center', gap: 8 },
  dots:     { flexDirection: 'row', gap: 6 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E5A38' },
  dotActive:{ backgroundColor: C.green, width: 20 },
  loading:  { color: C.white, fontSize: 13, fontWeight: '500' },
});
