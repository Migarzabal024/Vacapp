import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';

import SplashScreen            from './screens/SplashScreen';
import OnboardingScreen        from './screens/OnboardingScreen';
import LoginScreen             from './screens/LoginScreen';
import RegisterScreen          from './screens/RegisterScreen';
import AdminLoginScreen        from './screens/AdminLoginScreen';
import HomeScreen              from './screens/HomeScreen';
import ExploreScreen           from './screens/ExploreScreen';
import MarketScreen            from './screens/MarketScreen';
import PublicationsScreen      from './screens/PublicationsScreen';
import NewPublicationScreen    from './screens/NewPublicationScreen';
import PublicationDetailScreen from './screens/PublicationDetailScreen';
import TransactionsScreen      from './screens/TransactionsScreen';
import ProfileScreen           from './screens/ProfileScreen';
import EditProfileScreen       from './screens/EditProfileScreen';
import FavoritesScreen         from './screens/FavoritesScreen'
import AdminDashboardScreen    from './screens/AdminDashboardScreen';
import AdminUsersScreen        from './screens/AdminUsersScreen';
import AdminPublicationsScreen from './screens/AdminPublicationsScreen';
import AdminHelpDeskScreen     from './screens/AdminHelpDeskScreen';
import PurchaseScreen  from './screens/PurchaseScreen';
import QRScannerScreen from './screens/QRScannerScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab bar usuario ───────────────────────────────────────
function UserTabBar({ state, navigation }) {
  const TABS = [
    { route:'Home',    icon:'🏠', label:'Inicio' },
    { route:'Explore', icon:'⊞',  label:'Explorar' },
    { route:'FAB',     icon:'+',  label:'Publicar', fab:true },
    { route:'Market',  icon:'📈', label:'Mercado' },
    { route:'Trans',   icon:'💵', label:'Transacc.' },
  ];
  const realRoutes = ['Home','Explore','Market','Trans'];
  return (
    <View style={tb.bar}>
      {TABS.map(tab => {
        const isFocused = !tab.fab && state.index === realRoutes.indexOf(tab.route);
        const onPress = () => tab.fab ? navigation.navigate('NewPublication') : navigation.navigate(tab.route);
        if (tab.fab) return (
          <TouchableOpacity key="fab" style={tb.fabWrap} onPress={onPress} activeOpacity={0.85}>
            <View style={tb.fab}><Text style={tb.fabIcon}>+</Text></View>
            <Text style={tb.fabLabel}>Publicar</Text>
          </TouchableOpacity>
        );
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

function MainTabs() {
  return (
    <Tab.Navigator tabBar={p=><UserTabBar {...p}/>} screenOptions={{headerShown:false}}>
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Market"  component={MarketScreen} />
      <Tab.Screen name="Trans"   component={TransactionsScreen} />
    </Tab.Navigator>
  );
}

// ── Tab bar admin ─────────────────────────────────────────
function AdminTabBar({ state, navigation }) {
  const { signOut } = useAuth();
  const TABS = [
    { route:'AdminHome',    icon:'⊞',  label:'Inicio' },
    { route:'AdminUsers',   icon:'👥', label:'Usuarios' },
    { route:'AdminMkt',     icon:'🛒', label:'Mercado' },
    { route:'AdminSupport', icon:'💬', label:'Soporte' },
    { route:'EXIT',         icon:'→',  label:'Salir', exit:true },
  ];
  const realRoutes = ['AdminHome','AdminUsers','AdminMkt','AdminSupport'];
  return (
    <View style={[tb.bar,{backgroundColor:'#0D2818',borderTopColor:'#1F5C30'}]}>
      {TABS.map(tab => {
        const isFocused = !tab.exit && state.index === realRoutes.indexOf(tab.route);
        const onPress = () => { if(tab.exit){signOut();navigation.replace('Login');return;} navigation.navigate(tab.route); };
        return (
          <TouchableOpacity key={tab.route} style={tb.item} onPress={onPress} activeOpacity={0.7}>
            <Text style={[tb.icon, tab.exit?{color:'#E53935'}:isFocused?{color:'#43D854'}:{color:'#7AB88A'}]}>{tab.icon}</Text>
            <Text style={[tb.label, tab.exit?{color:'#E53935'}:isFocused?{color:'#43D854',fontWeight:'700'}:{color:'#7AB88A'}]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator tabBar={p=><AdminTabBar {...p}/>} screenOptions={{headerShown:false}}>
      <Tab.Screen name="AdminHome"    component={AdminDashboardScreen} />
      <Tab.Screen name="AdminUsers"   component={AdminUsersScreen} />
      <Tab.Screen name="AdminMkt"     component={AdminPublicationsScreen} />
      <Tab.Screen name="AdminSupport" component={AdminHelpDeskScreen} />
    </Tab.Navigator>
  );
}

// ── Pantalla de carga ─────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={{flex:1,backgroundColor:'#0D2818',alignItems:'center',justifyContent:'center',gap:16}}>
      <Text style={{fontSize:40}}>🐄</Text>
      <ActivityIndicator color="#4CAF50" size="large"/>
      <Text style={{color:'#7AB88A',fontSize:13}}>Cargando VacApp...</Text>
    </View>
  );
}

// ── Navegación principal ──────────────────────────────────
function AppNavigator() {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{headerShown:false, animation:'fade'}}>
      {!user ? (
        <>
          <Stack.Screen name="Splash"      component={SplashScreen} />
          <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
          <Stack.Screen name="Login"       component={LoginScreen} />
          <Stack.Screen name="Register"    component={RegisterScreen}   options={{animation:'slide_from_right'}} />
          <Stack.Screen name="AdminLogin"  component={AdminLoginScreen} options={{animation:'slide_from_right'}} />
        </>
      ) : profile?.role === 'admin' ? (
        <>
          <Stack.Screen name="AdminPanel"        component={AdminTabs} />
          <Stack.Screen name="AdminPublications" component={AdminPublicationsScreen} options={{animation:'slide_from_right'}} />
          <Stack.Screen name="AdminUsers"        component={AdminUsersScreen}        options={{animation:'slide_from_right'}} />
          <Stack.Screen name="AdminHelpDesk"     component={AdminHelpDeskScreen}     options={{animation:'slide_from_right'}} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs"          component={MainTabs} />
          <Stack.Screen name="Publications"      component={PublicationsScreen}      options={{animation:'slide_from_right'}} />
          <Stack.Screen name="NewPublication"    component={NewPublicationScreen}    options={{animation:'slide_from_bottom'}} />
          <Stack.Screen name="PublicationDetail" component={PublicationDetailScreen} options={{animation:'slide_from_right'}} />
          <Stack.Screen name="Transactions"      component={TransactionsScreen}      options={{animation:'slide_from_right'}} />
          <Stack.Screen name="Profile"           component={ProfileScreen}           options={{animation:'slide_from_right'}} />
          <Stack.Screen name="EditProfile"       component={EditProfileScreen}       options={{animation:'slide_from_right'}} />
          <Stack.Screen name="Favorites"         component={FavoritesScreen}         options={{animation:'slide_from_right'}} />
          <Stack.Screen name="Purchase"  component={PurchaseScreen}  options={{animation:'slide_from_bottom'}} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{animation:'slide_from_bottom'}} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const tb = StyleSheet.create({
  bar:{flexDirection:'row',backgroundColor:'#FFFFFF',borderTopWidth:1,borderTopColor:'#E8E8E8',paddingBottom:Platform.OS==='android'?10:24,paddingTop:8,alignItems:'flex-end'},
  item:{flex:1,alignItems:'center',gap:3},
  icon:{fontSize:22,color:'#999'},
  iconActive:{color:'#4CAF50'},
  label:{fontSize:10,color:'#999'},
  labelActive:{color:'#4CAF50',fontWeight:'700'},
  fabWrap:{flex:1,alignItems:'center',gap:2},
  fab:{width:54,height:54,borderRadius:27,backgroundColor:'#4CAF50',alignItems:'center',justifyContent:'center',marginTop:-24,elevation:8,shadowColor:'#4CAF50',shadowOpacity:0.5,shadowRadius:10,shadowOffset:{width:0,height:4}},
  fabIcon:{fontSize:32,color:'#FFF',lineHeight:38},
  fabLabel:{fontSize:10,color:'#4CAF50',fontWeight:'700'},
});
