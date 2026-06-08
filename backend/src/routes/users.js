// src/routes/users.js
// VMG-41 · Rutas del perfil de usuario

const express = require('express');
const router  = express.Router();
const { authMiddleware }          = require('../middleware/auth');
const { validate, rules }         = require('../middleware/validate');
const { getMe, updateMe, getMeKyc } = require('../controllers/usersController');

// GET  /api/users/me       → perfil del usuario autenticado
router.get('/me',      authMiddleware, getMe);

// PUT  /api/users/me       → actualizar nombre o email
router.put('/me',      authMiddleware, rules.updatePerfil, validate, updateMe);

// GET  /api/users/me/kyc   → estado KYC + documentos (para KYCStatus VMG-58)
router.get('/me/kyc',  authMiddleware, getMeKyc);

module.exports = router;
