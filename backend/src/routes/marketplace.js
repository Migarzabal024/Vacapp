// src/routes/marketplace.js
// VMG-47 · Filtros básicos para publicaciones
const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/auth');
const marketplaceController = require('../controllers/marketplaceController');

// GET /api/marketplace/publicaciones         → listar con filtros (requiere auth)
router.get('/publicaciones',     authMiddleware, marketplaceController.getPublicaciones);

// GET /api/marketplace/publicaciones/:id     → detalle (requiere auth)
router.get('/publicaciones/:id', authMiddleware, marketplaceController.getPublicacion);

// GET /api/marketplace/razas                 → razas disponibles para el filtro
router.get('/razas',             authMiddleware, marketplaceController.getRazas);

module.exports = router;
