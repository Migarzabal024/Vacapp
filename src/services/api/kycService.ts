// src/services/api/kycService.ts
// VMG-61 · Entidad Documento_KYC — service del frontend
//
// Consume los endpoints de /api/kyc
// Usado por:
//   · KYCStatus.jsx (VMG-58) → getStatus()
//   · Pantalla carga docs (VMG-60, otro miembro) → registrarDocumento(), getRequeridos()

import { httpClient } from '../httpClient';
import type { ApiResponse, DocumentoKyc, KycEstado, TipoDocumentoKyc } from '../../types';

// ── Tipos de respuesta ────────────────────────────────────────────────────────

export interface KycStatusResponse {
  estado_kyc: KycEstado;
  documentos: DocumentoKyc[];
  faltantes:  TipoDocumentoKyc[];
  completo:   boolean;
}

export interface KycRequeridosResponse {
  requeridos:  TipoDocumentoKyc[];
  completados: TipoDocumentoKyc[];
  faltantes:   TipoDocumentoKyc[];
  porcentaje:  number;
}

export interface RegistrarDocumentoPayload {
  tipo_documento: TipoDocumentoKyc;
  url_archivo:    string;
}

export interface RegistrarDocumentoResponse {
  documentos: DocumentoKyc[];
  faltantes:  TipoDocumentoKyc[];
  completo:   boolean;
}

// ── Labels en español para mostrar en la UI ───────────────────────────────────
export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumentoKyc, string> = {
  dni_frente:       'DNI (frente)',
  dni_dorso:        'DNI (dorso)',
  constancia_cuit:  'Constancia CUIT/CUIL',
  titulo:           'Título de propiedad o marca',
};

// ── Service ───────────────────────────────────────────────────────────────────
export const kycService = {

  /**
   * Obtiene estado KYC del usuario + documentos subidos + faltantes.
   * Consumido por KYCStatus.jsx (VMG-58).
   */
  getStatus: () =>
    httpClient.get<ApiResponse<KycStatusResponse>>('/kyc/status'),

  /**
   * Lista todos los documentos KYC del usuario.
   */
  getDocumentos: () =>
    httpClient.get<ApiResponse<DocumentoKyc[]>>('/kyc/documentos'),

  /**
   * Devuelve qué tipos de documento faltan y el porcentaje de avance.
   * Consumido por la pantalla de carga de docs (VMG-60).
   */
  getRequeridos: () =>
    httpClient.get<ApiResponse<KycRequeridosResponse>>('/kyc/documentos/requeridos'),

  /**
   * Registra un documento KYC en la BD.
   * La URL ya fue subida al storage por el cliente antes de llamar esto.
   * @param payload - { tipo_documento, url_archivo }
   */
  registrarDocumento: (payload: RegistrarDocumentoPayload) =>
    httpClient.post<ApiResponse<RegistrarDocumentoResponse>>(
      '/kyc/documentos',
      payload
    ),
};
