// src/controllers/authController.js
// VMG-38 · Refactorizado para usar utils compartidos
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { getClientIp }  = require('../utils/getClientIp');
const { ok, created, unauthorized, forbidden, conflict, serverError } = require('../utils/apiResponse');
const { findUserByEmail, findUserById } = require('../services/dbService');

function generateToken(user) {
  return jwt.sign(
    { id_usuario: user.id_usuario, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /auth/register ───────────────────────────────────────────────────────
async function register(req, res) {
  const { nombre_completo, email, password, dni, cuit_cuil, rol = 'productor' } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id_usuario FROM USUARIOS WHERE email = ? OR dni = ? OR cuit_cuil = ?',
      [email, dni, cuit_cuil]
    );
    if (existing.length) {
      return conflict(res, 'El email, DNI o CUIT ya está registrado');
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      `INSERT INTO USUARIOS (nombre_completo, email, password_hash, dni, cuit_cuil, rol)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, email, password_hash, dni, cuit_cuil, rol]
    );
    const id_usuario = result.insertId;

    if (rol === 'admin') {
      await pool.query('INSERT INTO ADMINS (id_usuario) VALUES (?)', [id_usuario]);
    }

    const ip = getClientIp(req);
    await pool.query(
      `INSERT INTO REGISTROS_TYC (id_usuario, version_tyc, ip_aceptacion, user_agent, contexto)
       VALUES (?, ?, ?, ?, 'registro')`,
      [id_usuario, 'v1.0', ip, req.headers['user-agent'] || null]
    );

    const user = { id_usuario, nombre_completo, email, dni, cuit_cuil, rol, estado_kyc: 'no_verificado' };
    const token = generateToken(user);
    return created(res, { user, token }, 'Registro exitoso');
  } catch (err) {
    console.error('[register]', err);
    return serverError(res);
  }
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return unauthorized(res, 'Credenciales incorrectas');
    if (user.estado_kyc === 'bloqueado') {
      return forbidden(res, 'Tu cuenta está bloqueada. Contactá soporte.');
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return unauthorized(res, 'Credenciales incorrectas');

    delete user.password_hash;
    const token = generateToken(user);
    return ok(res, { user, token }, 'Login exitoso');
  } catch (err) {
    console.error('[login]', err);
    return serverError(res);
  }
}

// ── GET /users/me ─────────────────────────────────────────────────────────────
async function getMe(req, res) {
  try {
    const user = await findUserById(req.user.id_usuario);
    if (!user) return unauthorized(res, 'Usuario no encontrado');
    return ok(res, user);
  } catch (err) {
    console.error('[getMe]', err);
    return serverError(res);
  }
}

module.exports = { register, login, getMe };
