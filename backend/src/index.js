// src/index.js
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');

const authRoutes  = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.set('trust proxy', 1); // Para obtener IP real detrás de proxies
app.use(helmet());
app.use(cors({ origin: '*' })); // En producción: restringir al dominio
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { success: false, message: 'Demasiadas solicitudes, intentá más tarde' },
}));

// Rate limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de autenticación' },
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',  authLimiter, authRoutes);
app.use('/api/users', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VacApp API corriendo', version: '1.0.0' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Inicio ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ VacApp API corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
