// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

// ── Helper: obtener IP real ───────────────────────────────────────────────────
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    null
  );
}

// ── Helper: generar token ─────────────────────────────────────────────────────
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
    // Verificar duplicados
    const [existing] = await pool.query(
      'SELECT id_usuario FROM USUARIOS WHERE email = ? OR dni = ? OR cuit_cuil = ?',
      [email, dni, cuit_cuil]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'El email, DNI o CUIT ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO USUARIOS (nombre_completo, email, password_hash, dni, cuit_cuil, rol)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, email, password_hash, dni, cuit_cuil, rol]
    );

    const id_usuario = result.insertId;

    // Si es admin, crear registro en ADMINS
    if (rol === 'admin') {
      await pool.query('INSERT INTO ADMINS (id_usuario) VALUES (?)', [id_usuario]);
    }

    // Registrar aceptación de TyC con IP
    const ip = getClientIp(req);
    await pool.query(
      `INSERT INTO REGISTROS_TYC (id_usuario, version_tyc, ip_aceptacion, user_agent, contexto)
       VALUES (?, ?, ?, ?, 'registro')`,
      [id_usuario, 'v1.0', ip, req.headers['user-agent'] || null]
    );

    const user = { id_usuario, nombre_completo, email, dni, cuit_cuil, rol, estado_kyc: 'no_verificado' };
    const token = generateToken(user);

    return res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM USUARIOS WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    if (user.estado_kyc === 'bloqueado') {
      return res.status(403).json({ success: false, message: 'Tu cuenta está bloqueada. Contactá soporte.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    delete user.password_hash;
    const token = generateToken(user);

    return res.json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

// ── GET /users/me ─────────────────────────────────────────────────────────────
async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, nombre_completo, email, dni, cuit_cuil, rol, estado_kyc, fecha_registro FROM USUARIOS WHERE id_usuario = ?',
      [req.user.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[getMe]', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
}

module.exports = { register, login, getMe };
