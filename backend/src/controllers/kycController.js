// src/controllers/kycController.js
// VMG-61 · Crear entidad Documento_KYC en el modelo de datos
// Sprint 2 — Desarrollo Inicial · VacaApp / BoviMatch
//
// ENDPOINTS:
//   GET  /api/kyc/status          → estado KYC + documentos del usuario
//   POST /api/kyc/documentos      → registrar un documento KYC subido
//   GET  /api/kyc/documentos      → listar documentos del usuario
//   GET  /api/kyc/documentos/requeridos → qué docs faltan para completar KYC
//
// INTEGRACIÓN CON EL EQUIPO:
//   · VMG-57 (otro miembro): usa updateKycEstado() de dbService para
//     cambiar estado_kyc del usuario cuando aprueba/rechaza docs
//   · VMG-60 (otro miembro): la pantalla de carga llama a POST /api/kyc/documentos
//   · VMG-58 (EF): KYCStatus.jsx consume GET /api/kyc/status o GET /api/users/me/kyc

const pool   = require('../config/db');
const { findUserById, getDocumentosKyc, updateKycEstado } = require('../services/dbService');
const { ok, created, badRequest, notFound, conflict, serverError } = require('../utils/apiResponse');

// Tipos de documento requeridos para completar KYC
const TIPOS_REQUERIDOS = ['dni_frente', 'dni_dorso', 'constancia_cuit', 'titulo'];

// ── GET /api/kyc/status ───────────────────────────────────────────────────────
// Devuelve estado_kyc del usuario + lista de documentos subidos.
// Consumido por KYCStatus.jsx (VMG-58) y la pantalla de carga (VMG-60).
async function getStatus(req, res) {
  try {
    const user = await findUserById(req.user.id_usuario);
    if (!user) return notFound(res, 'Usuario no encontrado');

    const documentos = await getDocumentosKyc(req.user.id_usuario);

    // Calcular qué docs faltan
    const tiposSubidos = documentos.map(d => d.tipo_documento);
    const faltantes    = TIPOS_REQUERIDOS.filter(t => !tiposSubidos.includes(t));

    return ok(res, {
      estado_kyc:  user.estado_kyc,
      documentos,
      faltantes,
      completo: faltantes.length === 0,
    });
  } catch (err) {
    console.error('[kyc:getStatus]', err);
    return serverError(res);
  }
}

// ── POST /api/kyc/documentos ──────────────────────────────────────────────────
// Registra un documento KYC en la BD.
// La URL del archivo ya fue subida al storage por el cliente (VMG-60).
//
// Body: { tipo_documento, url_archivo }
// Tipos válidos: 'dni_frente' | 'dni_dorso' | 'constancia_cuit' | 'titulo'
async function subirDocumento(req, res) {
  const { tipo_documento, url_archivo } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!tipo_documento || !url_archivo) {
    return badRequest(res, 'tipo_documento y url_archivo son requeridos');
  }

  if (!TIPOS_REQUERIDOS.includes(tipo_documento)) {
    return badRequest(res, `tipo_documento inválido. Valores aceptados: ${TIPOS_REQUERIDOS.join(', ')}`);
  }

  try {
    const user = await findUserById(id_usuario);
    if (!user) return notFound(res, 'Usuario no encontrado');

    // No permitir subir docs si ya está aprobado o bloqueado
    if (user.estado_kyc === 'aprobado') {
      return conflict(res, 'Tu KYC ya está aprobado. No podés reemplazar documentos.');
    }
    if (user.estado_kyc === 'bloqueado') {
      return conflict(res, 'Tu cuenta está bloqueada. No podés operar.');
    }

    // Si ya existe ese tipo de documento, lo reemplaza (UPDATE)
    const [existing] = await pool.query(
      'SELECT id_documento FROM DOCUMENTOS_KYC WHERE id_usuario = ? AND tipo_documento = ?',
      [id_usuario, tipo_documento]
    );

    if (existing.length) {
      // Reemplazar doc existente y resetear estado a pendiente
      await pool.query(
        `UPDATE DOCUMENTOS_KYC
         SET url_archivo = ?, estado_auditoria = 'pendiente',
             comentario_auditoria = NULL, fecha_subida = NOW()
         WHERE id_usuario = ? AND tipo_documento = ?`,
        [url_archivo, id_usuario, tipo_documento]
      );
    } else {
      // Insertar nuevo documento
      await pool.query(
        `INSERT INTO DOCUMENTOS_KYC (id_usuario, tipo_documento, url_archivo)
         VALUES (?, ?, ?)`,
        [id_usuario, tipo_documento, url_archivo]
      );
    }

    // Si el usuario era no_verificado, pasar a pendiente automáticamente
    if (user.estado_kyc === 'no_verificado') {
      await updateKycEstado(id_usuario, 'pendiente');
    }

    // Devolver estado actualizado
    const documentos = await getDocumentosKyc(id_usuario);
    const tiposSubidos = documentos.map(d => d.tipo_documento);
    const faltantes    = TIPOS_REQUERIDOS.filter(t => !tiposSubidos.includes(t));

    return created(res, {
      documentos,
      faltantes,
      completo: faltantes.length === 0,
    }, existing.length ? 'Documento actualizado' : 'Documento registrado');

  } catch (err) {
    console.error('[kyc:subirDocumento]', err);
    return serverError(res);
  }
}

// ── GET /api/kyc/documentos ───────────────────────────────────────────────────
// Lista todos los documentos KYC del usuario autenticado.
async function getDocumentos(req, res) {
  try {
    const documentos = await getDocumentosKyc(req.user.id_usuario);
    return ok(res, documentos);
  } catch (err) {
    console.error('[kyc:getDocumentos]', err);
    return serverError(res);
  }
}

// ── GET /api/kyc/documentos/requeridos ────────────────────────────────────────
// Devuelve qué tipos de documento faltan subir.
// Consumido por la pantalla de carga de docs (VMG-60).
async function getDocumentosRequeridos(req, res) {
  try {
    const documentos   = await getDocumentosKyc(req.user.id_usuario);
    const tiposSubidos = documentos.map(d => d.tipo_documento);
    const faltantes    = TIPOS_REQUERIDOS.filter(t => !tiposSubidos.includes(t));
    const completados  = TIPOS_REQUERIDOS.filter(t => tiposSubidos.includes(t));

    return ok(res, {
      requeridos:  TIPOS_REQUERIDOS,
      completados,
      faltantes,
      porcentaje:  Math.round((completados.length / TIPOS_REQUERIDOS.length) * 100),
    });
  } catch (err) {
    console.error('[kyc:getDocumentosRequeridos]', err);
    return serverError(res);
  }
}

module.exports = { getStatus, subirDocumento, getDocumentos, getDocumentosRequeridos };
