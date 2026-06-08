// src/controllers/usersController.js
// VMG-41 · Creación de la tabla de usuarios en la base de datos
// Gestiona el perfil del usuario autenticado.
//
// ENDPOINTS:
//   GET  /api/users/me         → perfil completo del usuario
//   PUT  /api/users/me         → actualizar nombre o email
//   GET  /api/users/me/kyc     → estado KYC + documentos (shortcut para el frontend)

const pool = require('../config/db');
const { findUserById, getDocumentosKyc } = require('../services/dbService');
const { ok, badRequest, notFound, conflict, serverError } = require('../utils/apiResponse');

// ── GET /api/users/me ─────────────────────────────────────────────────────────
// Devuelve el perfil completo del usuario autenticado.
// El frontend usa este endpoint para saber el estado_kyc y decidir qué mostrar.
async function getMe(req, res) {
  try {
    const user = await findUserById(req.user.id_usuario);
    if (!user) return notFound(res, 'Usuario no encontrado');
    return ok(res, user);
  } catch (err) {
    console.error('[getMe]', err);
    return serverError(res);
  }
}

// ── PUT /api/users/me ─────────────────────────────────────────────────────────
// Actualiza nombre_completo y/o email del usuario.
// No permite cambiar rol, estado_kyc, dni ni cuit_cuil desde el cliente.
async function updateMe(req, res) {
  const { nombre_completo, email } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!nombre_completo && !email) {
    return badRequest(res, 'No se enviaron campos para actualizar');
  }

  try {
    // Verificar que el nuevo email no esté en uso por otro usuario
    if (email) {
      const [existing] = await pool.query(
        'SELECT id_usuario FROM USUARIOS WHERE email = ? AND id_usuario != ?',
        [email, id_usuario]
      );
      if (existing.length) return conflict(res, 'El email ya está en uso');
    }

    // Construir query dinámico con solo los campos enviados
    const campos = [];
    const valores = [];
    if (nombre_completo) { campos.push('nombre_completo = ?'); valores.push(nombre_completo); }
    if (email)           { campos.push('email = ?');           valores.push(email); }
    valores.push(id_usuario);

    await pool.query(
      `UPDATE USUARIOS SET ${campos.join(', ')} WHERE id_usuario = ?`,
      valores
    );

    const user = await findUserById(id_usuario);
    return ok(res, user, 'Perfil actualizado');
  } catch (err) {
    console.error('[updateMe]', err);
    return serverError(res);
  }
}

// ── GET /api/users/me/kyc ─────────────────────────────────────────────────────
// Shortcut: devuelve estado_kyc + lista de documentos del usuario.
// El componente KYCStatus (VMG-58) consume este endpoint.
//
// Respuesta:
// {
//   estado_kyc: 'pendiente' | 'aprobado' | 'rechazado' | 'bloqueado' | 'no_verificado',
//   documentos: [ { id_documento, tipo_documento, estado_auditoria, fecha_subida } ]
// }
async function getMeKyc(req, res) {
  try {
    const user = await findUserById(req.user.id_usuario);
    if (!user) return notFound(res, 'Usuario no encontrado');

    const documentos = await getDocumentosKyc(req.user.id_usuario);

    return ok(res, {
      estado_kyc: user.estado_kyc,
      documentos,
    });
  } catch (err) {
    console.error('[getMeKyc]', err);
    return serverError(res);
  }
}

module.exports = { getMe, updateMe, getMeKyc };
