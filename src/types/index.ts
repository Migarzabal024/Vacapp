// ── USUARIO ──────────────────────────────────
export type UserRole = 'productor' | 'admin';
export type KycEstado = 'no_verificado' | 'pendiente' | 'aprobado' | 'bloqueado';

export interface User {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  dni: string;
  cuit_cuil: string;
  rol: UserRole;
  estado_kyc: KycEstado;
  fecha_registro: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials { email: string; password: string; }

export interface RegisterPayload {
  nombre_completo: string;
  email: string;
  password: string;
  dni: string;
  cuit_cuil: string;
  rol: UserRole;
}

// ── ANIMAL ───────────────────────────────────
export type GeneticRank = 'Elite' | 'Élite Internacional' | 'Superior' | 'Premium';
export type CategoriaAnimal = 'todos' | 'toros' | 'vacas' | 'novillos' | 'vaquillonas';
export type EstadoPublicacion = 'activa' | 'pausada' | 'bajada';

export interface Animal {
  id: string;
  name: string;
  breed: string;
  category: CategoriaAnimal;
  age: number;
  weight: number;
  price: number;
  location: string;
  province: string;
  geneticRank: GeneticRank;
  seller: string;
  sellerRating: number;
  sellerVerified: boolean;
  reproductiveHistory: string;
  geneticProjection: string;
  image: string;
  tags: string[];
}

// ── KYC ──────────────────────────────────────
export type TipoDocumentoKyc = 'dni_frente' | 'dni_dorso' | 'constancia_cuit' | 'titulo';
export type EstadoAuditoriaKyc = 'pendiente' | 'aprobado' | 'rechazado';

export interface DocumentoKyc {
  id_documento: number;
  id_usuario: number;
  tipo_documento: TipoDocumentoKyc;
  url_archivo: string;
  estado_auditoria: EstadoAuditoriaKyc;
  fecha_subida: string;
}

// ── API ───────────────────────────────────────
export interface ApiResponse<T> { data: T; message?: string; success: boolean; }
export interface ApiError { message: string; code?: string; statusCode?: number; }
