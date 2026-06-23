import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen       from './screens/SplashScreen';
import OnboardingScreen   from './screens/OnboardingScreen';
import LoginScreen        from './screens/LoginScreen';
import AdminLoginScreen   from './screens/AdminLoginScreen';
import HomeScreen         from './screens/HomeScreen';
import ExploreScreen      from './screens/ExploreScreen';
import MarketScreen       from './screens/MarketScreen';
import PublicationsScreen from './screens/PublicationsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import ProfileScreen      from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab bar inferior personalizada ────────────────────────
function CustomTabBar({ state, navigation }) {
  const TABS = [
    { route:'Home',         icon:'🏠', label:'Inicio' },
    { route:'Explore',      icon:'⊞',  label:'Explorar' },
    { route:'FAB',          icon:'+',  label:'Publicar', fab:true },
    { route:'Market',       icon:'📈', label:'Mercado' },
    { route:'Transactions', icon:'💵', label:'Transacc.' },
  ];

  return (
    <View style={tb.bar}>
      {TABS.map((tab, i) => {
        const realIndex = i > 2 ? i - 1 : i; // FAB no es tab real
        const isFocused = !tab.fab && state.index === realIndex;

        const onPress = () => {
          if (tab.fab) {
            navigation.navigate('Publications');
          } else {
            navigation.navigate(tab.route);
          }
        };

        if (tab.fab) {
          return (
            <TouchableOpacity key="fab" style={tb.fabWrap} onPress={onPress} activeOpacity={0.85}>
              <View style={tb.fab}>
                <Text style={tb.fabIcon}>+</Text>
              </View>
              <Text style={tb.fabLabel}>Publicar</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={tab.route} style={tb.item} onPress={onPress} activeOpacity={0.7}>
            <Text style={[tb.icon, isFocused && tb.iconActive]}>{tab.icon}</Text>
            <Text style={[tb.label, isFocused && tb.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar:{
    flexDirection:'row',
    backgroundColor:'#FFFFFF',
    borderTopWidth:1,
    borderTopColor:'#E8E8E8',
    paddingBottom: Platform.OS === 'android' ? 8 : 20,
    paddingTop:8,
    alignItems:'flex-end',
  },
  item:{ flex:1, alignItems:'center', paddingTop:4, gap:2 },
  icon:{ fontSize:22, color:'#999' },
  iconActive:{ color:'#4CAF50' },
  label:{ fontSize:10, color:'#999' },
  labelActive:{ color:'#4CAF50', fontWeight:'700' },
  fabWrap:{ flex:1, alignItems:'center', gap:2 },
  fab:{
    width:54, height:54, borderRadius:27,
    backgroundColor:'#4CAF50',
    alignItems:'center', justifyContent:'center',
    marginTop:-24,
    shadowColor:'#4CAF50',
    shadowOpacity:0.5,
    shadowRadius:10,
    shadowOffset:{ width:0, height:4 },
    elevation:8,
  },
  fabIcon:{ fontSize:30, color:'#FFF', lineHeight:36 },
  fabLabel:{ fontSize:10, color:'#4CAF50', fontWeight:'700' },
});

// ── Tabs principales ──────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown:false }}
    >
      <Tab.Screen name="Home"         component={HomeScreen} />
      <Tab.Screen name="Explore"      component={ExploreScreen} />
      <Tab.Screen name="Market"       component={MarketScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
    </Tab.Navigator>
  );
}

// ── App principal ─────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown:false, animation:'fade' }}
        >
          <Stack.Screen name="Splash"        component={SplashScreen} />
          <Stack.Screen name="Onboarding"    component={OnboardingScreen} />
          <Stack.Screen name="Login"         component={LoginScreen} />
          <Stack.Screen name="AdminLogin"    component={AdminLoginScreen} />
          <Stack.Screen name="MainTabs"      component={MainTabs} />
          <Stack.Screen name="Publications"  component={PublicationsScreen}
            options={{ animation:'slide_from_right' }} />
          <Stack.Screen name="Transactions"  component={TransactionsScreen}
            options={{ animation:'slide_from_right' }} />
          <Stack.Screen name="Profile"       component={ProfileScreen}
            options={{ animation:'slide_from_right' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
