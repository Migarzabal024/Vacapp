# VacApp — Backend API

## Stack
- **Node.js** + **Express** 4
- **MariaDB** 10.4 (XAMPP) vía `mysql2`
- **JWT** para autenticación

## Estructura de carpetas

```
backend/src/
├── config/
│   ├── db.js            → Pool de conexión MySQL/MariaDB
│   ├── initDb.js        → Script para inicializar la BD
│   └── schema.sql       → Schema completo de la BD
├── controllers/
│   ├── authController.js   → Login, register, getMe
│   └── kycController.js    → Estado KYC y documentos (VMG-61)
├── middleware/
│   ├── auth.js          → authMiddleware + requireAdmin
│   └── validate.js      → Middleware de validación express-validator
├── routes/
│   ├── auth.js          → POST /auth/register, /auth/login, GET /users/me
│   └── kyc.js           → GET /kyc/status, POST /kyc/documentos
├── services/
│   └── dbService.js     → Helpers de DB reutilizables (findUserById, etc.)
└── utils/
    ├── apiResponse.js   → Helpers de respuesta estandarizados
    └── getClientIp.js   → Extrae IP real del cliente
```

## Cómo agregar tu módulo (para el equipo)

1. Crear src/controllers/tuController.js — usá los helpers de utils/apiResponse.js
2. Crear src/routes/tuRuta.js
3. En src/index.js, descomentar o agregar:
   app.use('/api/tuRuta', require('./routes/tuRuta'));

## Respuestas API — formato estándar

Todos los endpoints devuelven:
  { "success": true/false, "message": "...", "data": {} }

Usar siempre los helpers de utils/apiResponse.js:
  const { ok, created, badRequest, serverError } = require('../utils/apiResponse');

## Setup inicial

  cd backend
  cp .env.example .env      # Editar con tu contraseña MariaDB
  npm install
  node src/config/initDb.js # Crea la BD y tablas
  npm run dev               # Inicia con nodemon

## Endpoints disponibles

  POST  /api/auth/register     → Registro
  POST  /api/auth/login        → Login
  POST  /api/auth/logout       → Logout (JWT)
  GET   /api/users/me          → Perfil (JWT)
  GET   /api/kyc/status        → Estado KYC (JWT)
  POST  /api/kyc/documentos    → Subir doc KYC (JWT)
  GET   /api/kyc/documentos    → Listar docs KYC (JWT)
  GET   /api/health            → Health check
