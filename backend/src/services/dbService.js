/**
 * services/dbService.js
 * Helpers de acceso a la DB reutilizables por todos los controllers.
 * Evita repetir queries comunes en múltiples archivos del equipo.
 */

const pool = require('../config/db');

/**
 * Busca un usuario por ID. Excluye password_hash.
 * @param {number} id_usuario
 * @returns {Object|null}
 */
async function findUserById(id_usuario) {
  const [rows] = await pool.query(
    `SELECT id_usuario, nombre_completo, email, dni, cuit_cuil,
            rol, estado_kyc, fecha_registro
     FROM USUARIOS WHERE id_usuario = ?`,
    [id_usuario]
  );
  return rows[0] || null;
}

/**
 * Busca un usuario por email. Incluye password_hash (para login).
 * @param {string} email
 * @returns {Object|null}
 */
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM USUARIOS WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

/**
 * Actualiza el estado_kyc de un usuario.
 * @param {number} id_usuario
 * @param {'no_verificado'|'pendiente'|'aprobado'|'bloqueado'} estado
 */
async function updateKycEstado(id_usuario, estado) {
  await pool.query(
    'UPDATE USUARIOS SET estado_kyc = ? WHERE id_usuario = ?',
    [estado, id_usuario]
  );
}

/**
 * Obtiene todos los documentos KYC de un usuario.
 * @param {number} id_usuario
 * @returns {Array}
 */
async function getDocumentosKyc(id_usuario) {
  const [rows] = await pool.query(
    `SELECT id_documento, tipo_documento, url_archivo,
            estado_auditoria, comentario_auditoria, fecha_subida
     FROM DOCUMENTOS_KYC WHERE id_usuario = ?
     ORDER BY fecha_subida DESC`,
    [id_usuario]
  );
  return rows;
}



/**
 * Verifica si un usuario tiene KYC aprobado.
 * Usado por publicaciones y transacciones para bloquear operaciones.
 * @param {number} id_usuario
 * @returns {boolean}
 */
async function isKycAprobado(id_usuario) {
  const [rows] = await pool.query(
    'SELECT estado_kyc FROM USUARIOS WHERE id_usuario = ?',
    [id_usuario]
  );
  return rows[0]?.estado_kyc === 'aprobado';
}

module.exports = { findUserById, findUserByEmail, updateKycEstado, getDocumentosKyc, isKycAprobado };
