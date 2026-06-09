// src/middleware/auth.js
const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id_usuario, rol, estado_kyc FROM USUARIOS WHERE id_usuario = ?',
      [payload.id_usuario]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso restringido a administradores' });
  }
  next();
}

module.exports = { authMiddleware, requireAdmin };
