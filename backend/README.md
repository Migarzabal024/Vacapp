# VacApp — Backend API

## Requisitos
- Node.js 18+
- MySQL 8.0+

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus datos de MySQL

# 3. Crear la base de datos y tablas
npm run db:init

# 4. Iniciar en desarrollo
npm run dev

# 5. Iniciar en producción
npm start
```

## Endpoints disponibles

| Método | Ruta             | Auth | Descripción              |
|--------|------------------|------|--------------------------|
| GET    | /api/health      | No   | Health check             |
| POST   | /api/auth/register | No | Registrar usuario        |
| POST   | /api/auth/login  | No   | Iniciar sesión           |
| POST   | /api/auth/logout | Sí   | Cerrar sesión            |
| GET    | /api/users/me    | Sí   | Datos del usuario actual |

## Base de datos — Tablas

| Tabla               | Descripción                              |
|---------------------|------------------------------------------|
| USUARIOS            | Usuarios del sistema                     |
| ADMINS              | Perfil extendido del administrador       |
| DOCUMENTOS_KYC      | Documentos de verificación de identidad  |
| PUBLICACIONES       | Animales publicados para venta           |
| IMAGENES_PUBLICACION| Imágenes de cada publicación             |
| REGISTROS_TYC       | Aceptación de TyC con IP (evidencia legal)|
| TRANSACCIONES       | Compra/venta con QR in situ              |
| RESULTADOS_CRIA     | Resultados post-transacción              |
| AUDITORIA_ADMIN     | Log de acciones administrativas          |

## Cambios respecto al diagrama original
- ✅ `facilidad_parto` eliminado de `RESULTADOS_CRIA`
- ✅ Tabla `ADMINS` agregada (separada de USUARIOS)
- ✅ IP guardada en `REGISTROS_TYC` y `TRANSACCIONES` como evidencia legal
- ✅ `user_agent` agregado para evidencia legal adicional
- ✅ ENUMs en lugar de strings libres para todos los estados
- ✅ Índices en todas las FK y columnas de búsqueda frecuente

## IP del emulador Android
La app conecta a `10.0.2.2:3000` desde el emulador Android.
Asegurate de que el backend esté corriendo en `localhost:3000`.
