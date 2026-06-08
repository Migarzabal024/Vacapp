// src/config/initDb.js
// Corré con: npm run db:init
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

async function init() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('✅ Conectado a MySQL');

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(sql);
  console.log('✅ Base de datos y tablas creadas correctamente');

  await conn.end();
  process.exit(0);
}

init().catch(err => {
  console.error('❌ Error al inicializar la BD:', err.message);
  process.exit(1);
});
