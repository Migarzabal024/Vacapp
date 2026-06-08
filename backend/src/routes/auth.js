// src/routes/auth.js
// VMG-41 · Actualizado para usar middleware validate compartido
const express = require('express');
const router  = express.Router();
const { register, login } = require('../controllers/authController');
const { authMiddleware }  = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', rules.register, validate, register);

// POST /api/auth/login
router.post('/login', rules.login, validate, login);

// POST /api/auth/logout (stateless — el cliente descarta el token)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Sesión cerrada' });
});

module.exports = router;
