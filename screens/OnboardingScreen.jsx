import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const C = {
  bg:       '#0D2818',
  green:    '#4CAF50',
  lGreen:   '#43D854',
  white:    '#FFFFFF',
  muted:    '#A0C4A8',
  iconOuter:'#1A4A28',
  dotOff:   '#2E5A38',
};

const SLIDES = [
  { id:'1', icon:'🧬', badge:'🧬', title:'Genética que Cruza',    sub:'MEJORA QUE SE VE',       desc:'Accedé a los mejores reproductores del país con datos genéticos verificados. DEP, EBV y proyección de cría al alcance de tu mano.', btn:'Continuar', last:false },
  { id:'2', icon:'🛡️', badge:'✅', title:'KYC & Trazabilidad',    sub:'CONFIANZA GARANTIZADA',  desc:'Cada vendedor es verificado con DNI, CUIT y documentación. Comprá con total seguridad sabiendo quién está del otro lado.',           btn:'Continuar', last:false },
  { id:'3', icon:'📱', badge:'📱', title:'Cierre In Situ',         sub:'QR ÚNICO EN EL CAMPO',   desc:'Generamos un código QR único para confirmar la transacción en el momento exacto de la entrega. Evidencia legal, sin papeleos.',       btn:'Empezar ahora', last:true },
];

export default function OnboardingScreen({ navigation }) {
  const [idx, setIdx] = useState(0);
  const flatRef  = useRef(null);
  const scrollX  = useRef(new Animated.Value(0)).current;
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems[0]) setIdx(viewableItems[0].index);
  }).current;

  const goNext = () => {
    if (idx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: idx + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <TouchableOpacity style={s.skip} onPress={() => navigation.replace('Login')}>
        <Text style={s.skipTxt}>Saltar</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <View style={s.iconWrap}>
              <View style={s.iconOuter}><Text style={s.iconMain}>{item.icon}</Text></View>
              <View style={s.iconBadge}><Text style={s.badgeTxt}>{item.badge}</Text></View>
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.sub}>{item.sub}</Text>
            <Text style={s.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => {
            const w = scrollX.interpolate({
              inputRange: [(i-1)*width, i*width, (i+1)*width],
              outputRange: [8, 22, 8], extrapolate: 'clamp',
            });
            const op = scrollX.interpolate({
              inputRange: [(i-1)*width, i*width, (i+1)*width],
              outputRange: [0.4, 1, 0.4], extrapolate: 'clamp',
            });
            return <Animated.View key={i} style={[s.dot, { width: w, opacity: op }]} />;
          })}
        </View>

        <TouchableOpacity style={s.btn} onPress={goNext} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{SLIDES[idx]?.btn} ›</Text>
        </TouchableOpacity>

        {SLIDES[idx]?.last && (
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={s.loginRow}>
            <Text style={s.loginTxt}>Ya tengo una cuenta → <Text style={s.loginLink}>Iniciar sesión</Text></Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  skip:      { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  skipTxt:   { color: C.muted, fontSize: 14 },
  slide:     { width, alignItems: 'center', paddingHorizontal: 36, paddingTop: height * 0.12 },
  iconWrap:  { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  iconOuter: { width: 110, height: 110, borderRadius: 55, backgroundColor: C.iconOuter, alignItems: 'center', justifyContent: 'center' },
  iconMain:  { fontSize: 52 },
  iconBadge: { position: 'absolute', bottom: 0, right: 0, width: 46, height: 46, borderRadius: 23, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.bg },
  badgeTxt:  { fontSize: 22 },
  title:     { fontSize: 28, fontWeight: '700', color: C.white, textAlign: 'center', marginBottom: 8 },
  sub:       { fontSize: 11, fontWeight: '600', color: C.lGreen, letterSpacing: 2.5, textAlign: 'center', marginBottom: 20 },
  desc:      { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 23 },
  footer:    { paddingHorizontal: 24, paddingBottom: 44, alignItems: 'center' },
  dots:      { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 24 },
  dot:       { height: 8, borderRadius: 4, backgroundColor: C.green },
  btn:       { backgroundColor: C.green, borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
  btnTxt:    { color: C.white, fontSize: 16, fontWeight: '700' },
  loginRow:  { marginTop: 16 },
  loginTxt:  { color: C.muted, fontSize: 14 },
  loginLink: { color: C.white, fontWeight: '600' },
});
