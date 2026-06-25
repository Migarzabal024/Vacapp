// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://ozwwebxuqzbmianmlwgd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3dlYnh1cXpibWlhbm1sd2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODYzOTUsImV4cCI6MjA5Nzg2MjM5NX0.hEe61QfVZLn_cU2GPUEL1DZ3cBJkxavgUfMtnDZEqsQ';

// Storage en memoria — funciona siempre en Expo Go
// La sesión se mantiene mientras la app está abierta
const memoryStorage = {};
const MemoryStorageAdapter = {
  getItem:    (key) => memoryStorage[key] ?? null,
  setItem:    (key, value) => { memoryStorage[key] = value; },
  removeItem: (key) => { delete memoryStorage[key]; },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:            MemoryStorageAdapter,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});
