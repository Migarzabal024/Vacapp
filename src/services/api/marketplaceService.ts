// src/services/api/marketplaceService.ts
// VMG-47 · Filtros básicos para publicaciones
//
// Consumido por HomeScreen y el hook useMarketplace

import { httpClient } from '../httpClient';
import type { ApiResponse } from '../../types';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type OrdenPublicacion = 'precio_asc' | 'precio_desc' | 'reciente' | 'edad_asc';

export interface FiltrosPublicacion {
  search?:     string;
  raza?:       string;
  categoria?:  string;
  precio_min?: number;
  precio_max?: number;
  edad_min?:   number;
  edad_max?:   number;
  orden?:      OrdenPublicacion;
  page?:       number;
  limit?:      number;
}

export interface PublicacionResumen {
  id_publicacion:        number;
  titulo:                string;
  raza:                  string;
  precio:                number;
  edad_meses:            number;
  historial_reproductivo: string | null;
  proyeccion_genetica:   string | null;
  estado:                'activa' | 'pausada' | 'bajada';
  fecha_publicacion:     string;
  vendedor_id:           number;
  vendedor_nombre:       string;
  vendedor_kyc:          string;
}

export interface Paginacion {
  total:   number;
  page:    number;
  limit:   number;
  paginas: number;
  hay_mas: boolean;
}

export interface RespuestaPublicaciones {
  publicaciones:     PublicacionResumen[];
  paginacion:        Paginacion;
  filtros_aplicados: FiltrosPublicacion;
}

export interface RazaDisponible {
  raza:     string;
  cantidad: number;
}

// ── Labels de orden para mostrar en la UI ─────────────────────────────────────
export const ORDEN_LABELS: Record<OrdenPublicacion, string> = {
  reciente:    'Más recientes',
  precio_asc:  'Menor precio',
  precio_desc: 'Mayor precio',
  edad_asc:    'Más jóvenes',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildQueryString(filtros: FiltrosPublicacion): string {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      params.append(k, String(v));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ── Service ───────────────────────────────────────────────────────────────────
export const marketplaceService = {

  /**
   * Lista publicaciones con filtros opcionales.
   * @param filtros - Objeto con los filtros a aplicar
   */
  getPublicaciones: (filtros: FiltrosPublicacion = {}) =>
    httpClient.get<ApiResponse<RespuestaPublicaciones>>(
      `/marketplace/publicaciones${buildQueryString(filtros)}`
    ),

  /**
   * Obtiene el detalle de una publicación por ID.
   */
  getPublicacion: (id: number) =>
    httpClient.get<ApiResponse<PublicacionResumen>>(
      `/marketplace/publicaciones/${id}`
    ),

  /**
   * Devuelve las razas actualmente en el catálogo.
   * Usado para poblar el selector de raza en el panel de filtros.
   */
  getRazas: () =>
    httpClient.get<ApiResponse<RazaDisponible[]>>('/marketplace/razas'),
};
