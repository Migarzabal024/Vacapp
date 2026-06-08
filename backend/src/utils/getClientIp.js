/**
 * utils/getClientIp.js
 * Extrae la IP real del cliente considerando proxies.
 * Usado en: registro TyC, transacciones, auditoría admin.
 */

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    null
  );
}

module.exports = { getClientIp };
