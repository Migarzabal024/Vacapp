// src/routes/kyc.js
// VMG-61 · Entidad Documento_KYC — rutas completas
const express = require('express');
const router  = express.Router();
const { authMiddleware }  = require('../middleware/auth');
const { body }            = require('express-validator');
const { validate }        = require('../middleware/validate');
const kycController       = require('../controllers/kycController');

const validarDocumento = [
  body('tipo_documento')
    .notEmpty().withMessage('tipo_documento requerido')
    .isIn(['dni_frente', 'dni_dorso', 'constancia_cuit', 'titulo'])
    .withMessage('tipo_documento inválido'),
  body('url_archivo')
    .notEmpty().withMessage('url_archivo requerido')
    .isURL({ require_tld: false }).withMessage('url_archivo debe ser una URL válida'),
];

// GET  /api/kyc/status                → estado KYC + docs + faltantes
router.get('/status',                authMiddleware, kycController.getStatus);

// GET  /api/kyc/documentos            → listar documentos del usuario
router.get('/documentos',            authMiddleware, kycController.getDocumentos);

// GET  /api/kyc/documentos/requeridos → qué docs faltan (para VMG-60)
router.get('/documentos/requeridos', authMiddleware, kycController.getDocumentosRequeridos);

// POST /api/kyc/documentos            → registrar documento subido
router.post('/documentos',           authMiddleware, validarDocumento, validate, kycController.subirDocumento);

module.exports = router;
