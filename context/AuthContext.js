// context/AuthContext.js
// Contexto global de autenticación — disponible en toda la app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión activa al iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil del usuario desde la base de datos
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error) setProfile(data);
    } catch (e) {
      console.error('Error cargando perfil:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Registrar usuario nuevo ───────────────────────
  const signUp = async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'user' },
      },
    });
    if (error) throw error;
    return data;
  };

  // ── Iniciar sesión ────────────────────────────────
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // ── Iniciar sesión como admin ─────────────────────
  const signInAdmin = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Verificar que sea admin
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (prof?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('No tenés permisos de administrador');
    }
    return data;
  };

  // ── Cerrar sesión ─────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ── Actualizar perfil ─────────────────────────────
  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin,
      signUp, signIn, signInAdmin, signOut, updateProfile, fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
