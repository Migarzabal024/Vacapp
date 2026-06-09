// src/routes/auth.js
const express = require('express');
const router  = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// POST /auth/register
router.post('/register',
  [
    body('nombre_completo').trim().notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Contraseña mínimo 8 caracteres'),
    body('dni').trim().notEmpty().withMessage('DNI requerido'),
    body('cuit_cuil').trim().notEmpty().withMessage('CUIT/CUIL requerido'),
  ],
  validate,
  register
);

// POST /auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  login
);

// POST /auth/logout (stateless — el cliente descarta el token)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Sesión cerrada' });
});

// GET /users/me
router.get('/me', authMiddleware, getMe);

module.exports = router;
