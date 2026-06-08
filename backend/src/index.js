// src/index.js
// VacaApp Backend — Sprint 2
//
// ── CÓMO AGREGAR NUEVAS RUTAS (para el equipo) ────────────────────────────────
// 1. Crear tu controller en src/controllers/tuController.js
// 2. Crear tu router en src/routes/tuRuta.js  
// 3. Importarlo aquí y registrarlo con app.use('/api/tuRuta', tuRuta)
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

// ── Rutas ─────────────────────────────────────────────────────────────────────
const authRoutes  = require('./routes/auth');
const usersRoutes = require('./routes/users');       // VMG-41 · EF
const kycRoutes   = require('./routes/kyc');         // VMG-61 · EF
// const publicacionesRoutes = require('./routes/publicaciones'); // VMG-32 · pendiente equipo
const marketplaceRoutes = require('./routes/marketplace'); // VMG-47 · EF
// const transaccionesRoutes = require('./routes/transacciones'); // Sprint 3 · pendiente equipo

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Demasiadas solicitudes, intentá más tarde' },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de autenticación' },
});

// ── Registro de rutas ─────────────────────────────────────────────────────────
app.use('/api/auth',  authLimiter, authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/kyc',   kycRoutes);
// app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/marketplace', marketplaceRoutes);
// app.use('/api/transacciones', transaccionesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'VacApp API corriendo',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── Inicio ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ VacApp API corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Node:    ${process.version}`);
});

module.exports = app;
