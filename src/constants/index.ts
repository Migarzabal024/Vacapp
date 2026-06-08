import type { CategoriaAnimal, GeneticRank } from '../types';

export const COLORS = {
  primary:       '#4EBA2E',
  primaryDark:   '#1E3D2B',
  primaryDeep:   '#0A1E16',
  olive:         '#868C5A',
  border:        '#E6F1E6',
  bg:            '#F2F2F2',
  white:         '#FFFFFF',
  textPrimary:   '#0A1E16',
  textSecondary: '#868C5A',
  textLight:     '#1A1A1A',
  error:         '#ef4444',
  warning:       '#f59e0b',
} as const;

export const APP_NAME    = 'VacApp';
export const APP_TAGLINE = 'Genética que cruza';

// Cambiar según entorno:
// Emulador Android → 10.0.2.2
// Celular físico   → IP de tu PC en la red WiFi
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

export const API_ENDPOINTS = {
  // Auth
  login:    '/auth/login',
  register: '/auth/register',
  logout:   '/auth/logout',
  // Usuarios
  me:       '/users/me',
  meKyc:    '/users/me/kyc',
  // KYC — VMG-61
  kycStatus:      '/kyc/status',
  kycDocumentos:  '/kyc/documentos',
  kycRequeridos:  '/kyc/documentos/requeridos',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'vacapp_auth_token',
  USER_DATA:  'vacapp_user_data',
} as const;

export const CATEGORIAS: { key: CategoriaAnimal; label: string; emoji: string }[] = [
  { key: 'todos',       label: 'Todos',       emoji: '🐄' },
  { key: 'toros',       label: 'Toros',       emoji: '🐂' },
  { key: 'vacas',       label: 'Vacas',       emoji: '🐮' },
  { key: 'novillos',    label: 'Novillos',    emoji: '🥩' },
  { key: 'vaquillonas', label: 'Vaquillonas', emoji: '🌿' },
];

export const RANK_COLORS: Record<GeneticRank, string> = {
  'Elite':               '#4EBA2E',
  'Élite Internacional': '#4EBA2E',
  'Superior':            '#1E3D2B',
  'Premium':             '#868C5A',
};

export const ANIMALS_MOCK = [
  {
    id: '1', name: 'Torito Génesis', breed: 'Aberdeen Angus',
    category: 'toros' as CategoriaAnimal, age: 18, weight: 480, price: 850000,
    location: 'Córdoba', province: 'Córdoba, AR',
    geneticRank: 'Elite' as GeneticRank,
    seller: 'Juan M. Berazategui', sellerRating: 4.8, sellerVerified: true,
    reproductiveHistory: 'Sin servicio previo',
    geneticProjection: 'DEP Peso destete: +28 | DEP Terneza: +0.8',
    image: 'https://images.unsplash.com/photo-1654120006672-efbfc299938e?w=800',
    tags: ['KYC', 'Premium'],
  },
  {
    id: '2', name: 'Vaca Estrella VII', breed: 'Hereford',
    category: 'vacas' as CategoriaAnimal, age: 36, weight: 520, price: 620000,
    location: 'General Pico', province: 'La Pampa, AR',
    geneticRank: 'Superior' as GeneticRank,
    seller: 'Estancia La Esperanza', sellerRating: 4.6, sellerVerified: true,
    reproductiveHistory: '2 partos normales',
    geneticProjection: 'DEP Leche: +180 | DEP Fertilidad: +12',
    image: 'https://images.unsplash.com/photo-1613443600547-37f29323fe7c?w=800',
    tags: ['Trazabilidad', 'Preñez'],
  },
  {
    id: '3', name: 'Novillo Zeus III', breed: 'Braford',
    category: 'novillos' as CategoriaAnimal, age: 24, weight: 550, price: 720000,
    location: 'Resistencia', province: 'Chaco, AR',
    geneticRank: 'Premium' as GeneticRank,
    seller: 'El Fortín Ganadero', sellerRating: 4.9, sellerVerified: true,
    reproductiveHistory: 'No aplica',
    geneticProjection: 'DEP Ganancia: +0.45 | DEP Área bife: +1.2',
    image: 'https://images.unsplash.com/photo-1635456268737-8610b8673b0d?w=800',
    tags: ['Engorde', 'Premium'],
  },
  {
    id: '4', name: 'Vaquillona Luna', breed: 'Brangus',
    category: 'vaquillonas' as CategoriaAnimal, age: 20, weight: 380, price: 480000,
    location: 'Corrientes', province: 'Corrientes, AR',
    geneticRank: 'Elite' as GeneticRank,
    seller: 'Hacienda Don Rubén', sellerRating: 4.5, sellerVerified: false,
    reproductiveHistory: 'Sin servicio previo',
    geneticProjection: 'DEP Adaptación: Alta | DEP Preñez: +15',
    image: 'https://images.unsplash.com/photo-1558152761-aee570eb5cb0?w=800',
    tags: ['Tropical'],
  },
  {
    id: '5', name: 'Toro Prometeo', breed: 'Limousin',
    category: 'toros' as CategoriaAnimal, age: 30, weight: 820, price: 1850000,
    location: 'Pergamino', province: 'Buenos Aires, AR',
    geneticRank: 'Élite Internacional' as GeneticRank,
    seller: 'Genética Pampeana S.A.', sellerRating: 5.0, sellerVerified: true,
    reproductiveHistory: '420 servicios registrados',
    geneticProjection: 'EBV Terneza: +9.8 | EBV Ganancia: +58',
    image: 'https://images.unsplash.com/photo-1667912300809-65cb6e28c135?w=800',
    tags: ['KYC', 'Elite Internacional'],
  },
];
