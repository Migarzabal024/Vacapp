// src/middleware/validate.js
// VMG-41 · Middleware de validación compartido
//
// USO en cualquier router del equipo:
//   const { validate, rules } = require('../middleware/validate');
//   router.post('/ruta', rules.register, validate, controller.fn);
//
// Para reglas propias:
//   const { body } = require('express-validator');
//   router.post('/ruta', [body('campo').notEmpty()], validate, controller.fn);

const { validationResult, body } = require('express-validator');

// ── Middleware que ejecuta la validación ──────────────────────────────────────
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Datos inválidos',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Conjuntos de reglas reutilizables ─────────────────────────────────────────
const rules = {

  // Registro de usuario
  register: [
    body('nombre_completo').trim().notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Contraseña mínimo 8 caracteres'),
    body('dni').trim().notEmpty().withMessage('DNI requerido'),
    body('cuit_cuil').trim().notEmpty().withMessage('CUIT/CUIL requerido'),
  ],

  // Login
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],

  // Actualización de perfil
  updatePerfil: [
    body('nombre_completo').optional().trim().notEmpty().withMessage('Nombre no puede estar vacío'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  ],

  // Publicación de ganado (para el compañero de VMG-32)
  publicacion: [
    body('titulo').trim().notEmpty().withMessage('Título requerido'),
    body('raza').trim().notEmpty().withMessage('Raza requerida'),
    body('precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('edad_meses').isInt({ min: 1 }).withMessage('Edad en meses inválida'),
  ],
};




// ── Reglas completas para publicación (VMG-55) ────────────────────────────────
// Combinar con rules.publicacionGenetica para validación completa:
//   router.post('/publicaciones', [...rules.publicacion, ...rules.publicacionGenetica], validate, ctrl)
rules.publicacion = [
  body('titulo')
    .trim().notEmpty().withMessage('El título es requerido')
    .isLength({ min: 3, max: 200 }).withMessage('Título: entre 3 y 200 caracteres'),
  body('raza')
    .trim().notEmpty().withMessage('La raza es requerida')
    .isLength({ max: 100 }).withMessage('Raza máximo 100 caracteres'),
  body('precio')
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 1 }).withMessage('El precio debe ser mayor a 0')
    .custom(val => {
      if (parseFloat(val) > 999999999) throw new Error('Precio fuera de rango');
      return true;
    }),
  body('edad_meses')
    .notEmpty().withMessage('La edad en meses es requerida')
    .isInt({ min: 1, max: 300 }).withMessage('Edad: entre 1 y 300 meses'),
];

// ── Validación de información genética (VMG-52) ───────────────────────────────
// Formato esperado: "DEP Peso destete: +28 | EBV Ganancia: +58"
// Cada indicador separado por " | ", formato "<DEP|EBV> <nombre>: <±valor>"
function validarProyeccionGenetica(valor) {
  if (!valor || valor.trim() === '') return null; // es opcional
  const partes = valor.split('|').map(p => p.trim()).filter(Boolean);
  for (const parte of partes) {
    const match = parte.match(/^(DEP|EBV)\s+(.+?):\s*([+-]?\d+\.?\d*)$/i);
    if (!match) return `Indicador con formato inválido: "${parte}". Usá: DEP Nombre: +valor`;
  }
  return null;
}

// Reglas para el formulario de publicación (usadas en VMG-55 y VMG-32)
rules.publicacionGenetica = [
  body('proyeccion_genetica')
    .optional()
    .custom(val => {
      const error = validarProyeccionGenetica(val);
      if (error) throw new Error(error);
      return true;
    }),
  body('historial_reproductivo')
    .optional()
    .isString().withMessage('historial_reproductivo debe ser texto')
    .isLength({ max: 1000 }).withMessage('historial_reproductivo máximo 1000 caracteres'),
];

module.exports = { validate, rules, validarProyeccionGenetica };
