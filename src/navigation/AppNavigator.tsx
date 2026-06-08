import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';

import { SplashScreen }       from '../screens/SplashScreen';
import { OnboardingScreen }   from '../screens/OnboardingScreen';
import { LoginScreen }        from '../screens/LoginScreen';
import { RegisterScreen }     from '../screens/RegisterScreen';
import { HomeScreen }         from '../screens/HomeScreen';
import { AnimalDetailScreen } from '../screens/AnimalDetailScreen';
import { PublicarScreen }     from '../screens/PublicarScreen';    // VMG-55

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

export function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home"         component={HomeScreen} />
            <Stack.Screen name="Publicar"     component={PublicarScreen} />
            <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen}
              options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash"     component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Register"   component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
