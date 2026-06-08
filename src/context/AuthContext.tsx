import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState, LoginCredentials, RegisterPayload, User } from '../types';
import { STORAGE_KEYS } from '../constants';
import { authService } from '../services';

interface AuthContextValue extends AuthState {
  login:    (c: LoginCredentials) => Promise<void>;
  register: (p: RegisterPayload)  => Promise<void>;
  logout:   ()                    => Promise<void>;
  setUser:  (u: User)             => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null, isAuthenticated: false, isLoading: true,
  });

  useEffect(() => {
    async function restoreSession() {
      try {
        const [token, raw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        ]);
        if (token && raw) {
          setState({ user: JSON.parse(raw), token, isAuthenticated: true, isLoading: false });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const res = await authService.login(credentials);
      const { user, token } = res.data;
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      setState(s => ({ ...s, isLoading: false }));
      throw e;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const res = await authService.register(payload);
      const { user, token } = res.data;
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      setState(s => ({ ...s, isLoading: false }));
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const setUser = useCallback((user: User) => {
    AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
