// src/controllers/marketplaceController.js
// VMG-47 · Agregar e implementar filtros básicos para publicaciones
// Sprint 2 — Desarrollo Inicial · VacaApp / BoviMatch
//
// ENDPOINTS:
//   GET /api/marketplace/publicaciones        → listar con filtros
//   GET /api/marketplace/publicaciones/:id    → detalle de una publicación
//   GET /api/marketplace/razas                → lista de razas disponibles (para el filtro)
//
// FILTROS DISPONIBLES (query params):
//   ?raza=Aberdeen+Angus
//   ?precio_min=100000&precio_max=500000
//   ?edad_min=6&edad_max=36          (en meses)
//   ?categoria=toros                 (mapea a raza internamente via tags)
//   ?search=torito                   (busca en titulo y raza)
//   ?orden=precio_asc|precio_desc|reciente|edad_asc
//   ?page=1&limit=20
//
// INTEGRACIÓN CON EL EQUIPO:
//   · VMG-32 (otro miembro): crea las publicaciones via POST /api/publicaciones
//     Este controller solo las LEE para el marketplace
//   · KYC check: solo muestra publicaciones de vendedores con KYC aprobado
//   · VMG-52 (EF): proyeccion_genetica se filtra/muestra desde este controller

const pool = require('../config/db');
const { ok, badRequest, notFound, serverError } = require('../utils/apiResponse');

// Mapeo de categoría frontend → razas en la BD
// El compañero de VMG-32 debe respetar estos nombres de raza al publicar
const CATEGORIA_RAZAS = {
  toros:       ['Aberdeen Angus', 'Hereford', 'Limousin', 'Braford', 'Brangus', 'Shorthorn', 'Charolais'],
  vacas:       ['Aberdeen Angus', 'Hereford', 'Limousin', 'Braford', 'Brangus', 'Shorthorn'],
  novillos:    ['Braford', 'Brangus', 'Aberdeen Angus', 'Hereford'],
  vaquillonas: ['Brangus', 'Aberdeen Angus', 'Hereford', 'Braford'],
};

const ORDENES_VALIDOS = ['precio_asc', 'precio_desc', 'reciente', 'edad_asc'];

// ── GET /api/marketplace/publicaciones ───────────────────────────────────────
async function getPublicaciones(req, res) {
  try {
    const {
      raza, search,
      precio_min, precio_max,
      edad_min, edad_max,
      categoria,
      orden    = 'reciente',
      page     = 1,
      limit    = 20,
    } = req.query;

    // Validaciones básicas
    if (orden && !ORDENES_VALIDOS.includes(orden)) {
      return badRequest(res, `orden inválido. Valores: ${ORDENES_VALIDOS.join(', ')}`);
    }
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset   = (pageNum - 1) * limitNum;

    // ── Construcción dinámica del WHERE ──────────────────────────────────────
    const conditions = [
      "p.estado = 'activa'",
      "u.estado_kyc = 'aprobado'",   // Solo vendedores verificados
    ];
    const params = [];

    if (search) {
      conditions.push('(p.titulo LIKE ? OR p.raza LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (raza) {
      conditions.push('p.raza = ?');
      params.push(raza);
    }

    if (categoria && categoria !== 'todos' && CATEGORIA_RAZAS[categoria]) {
      const placeholders = CATEGORIA_RAZAS[categoria].map(() => '?').join(', ');
      conditions.push(`p.raza IN (${placeholders})`);
      params.push(...CATEGORIA_RAZAS[categoria]);
    }

    if (precio_min) {
      const v = parseFloat(precio_min);
      if (isNaN(v)) return badRequest(res, 'precio_min debe ser un número');
      conditions.push('p.precio >= ?');
      params.push(v);
    }

    if (precio_max) {
      const v = parseFloat(precio_max);
      if (isNaN(v)) return badRequest(res, 'precio_max debe ser un número');
      conditions.push('p.precio <= ?');
      params.push(v);
    }

    if (edad_min) {
      const v = parseInt(edad_min);
      if (isNaN(v)) return badRequest(res, 'edad_min debe ser un número entero');
      conditions.push('p.edad_meses >= ?');
      params.push(v);
    }

    if (edad_max) {
      const v = parseInt(edad_max);
      if (isNaN(v)) return badRequest(res, 'edad_max debe ser un número entero');
      conditions.push('p.edad_meses <= ?');
      params.push(v);
    }

    // ── ORDER BY ─────────────────────────────────────────────────────────────
    const orderMap = {
      precio_asc:  'p.precio ASC',
      precio_desc: 'p.precio DESC',
      reciente:    'p.fecha_publicacion DESC',
      edad_asc:    'p.edad_meses ASC',
    };
    const orderBy = orderMap[orden] || 'p.fecha_publicacion DESC';

    const where = conditions.join(' AND ');

    // ── Query principal ───────────────────────────────────────────────────────
    const sql = `
      SELECT
        p.id_publicacion,
        p.titulo,
        p.raza,
        p.precio,
        p.edad_meses,
        p.historial_reproductivo,
        p.proyeccion_genetica,
        p.estado,
        p.fecha_publicacion,
        u.id_usuario     AS vendedor_id,
        u.nombre_completo AS vendedor_nombre,
        u.estado_kyc     AS vendedor_kyc
      FROM PUBLICACIONES p
      INNER JOIN USUARIOS u ON p.id_vendedor = u.id_usuario
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    params.push(limitNum, offset);

    // Query de total para paginación
    const countSql = `
      SELECT COUNT(*) AS total
      FROM PUBLICACIONES p
      INNER JOIN USUARIOS u ON p.id_vendedor = u.id_usuario
      WHERE ${where}
    `;
    const countParams = params.slice(0, -2); // sin LIMIT y OFFSET

    const [[rows], [[{ total }]]] = await Promise.all([
      pool.query(sql, params),
      pool.query(countSql, countParams),
    ]);

    return ok(res, {
      publicaciones: rows,
      paginacion: {
        total,
        page:     pageNum,
        limit:    limitNum,
        paginas:  Math.ceil(total / limitNum),
        hay_mas:  pageNum * limitNum < total,
      },
      filtros_aplicados: {
        search:     search || null,
        raza:       raza || null,
        categoria:  categoria || null,
        precio_min: precio_min ? parseFloat(precio_min) : null,
        precio_max: precio_max ? parseFloat(precio_max) : null,
        edad_min:   edad_min   ? parseInt(edad_min)     : null,
        edad_max:   edad_max   ? parseInt(edad_max)     : null,
        orden,
      },
    });
  } catch (err) {
    console.error('[marketplace:getPublicaciones]', err);
    return serverError(res);
  }
}

// ── GET /api/marketplace/publicaciones/:id ────────────────────────────────────
async function getPublicacion(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT
         p.*,
         u.id_usuario     AS vendedor_id,
         u.nombre_completo AS vendedor_nombre,
         u.estado_kyc     AS vendedor_kyc
       FROM PUBLICACIONES p
       INNER JOIN USUARIOS u ON p.id_vendedor = u.id_usuario
       WHERE p.id_publicacion = ? AND p.estado = 'activa'`,
      [id]
    );
    if (!rows.length) return notFound(res, 'Publicación no encontrada');
    return ok(res, rows[0]);
  } catch (err) {
    console.error('[marketplace:getPublicacion]', err);
    return serverError(res);
  }
}

// ── GET /api/marketplace/razas ────────────────────────────────────────────────
// Devuelve las razas actualmente en el catálogo para poblar el filtro.
async function getRazas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT raza, COUNT(*) as cantidad
       FROM PUBLICACIONES
       WHERE estado = 'activa'
       GROUP BY raza
       ORDER BY cantidad DESC`
    );
    return ok(res, rows);
  } catch (err) {
    console.error('[marketplace:getRazas]', err);
    return serverError(res);
  }
}

module.exports = { getPublicaciones, getPublicacion, getRazas };
