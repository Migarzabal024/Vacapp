/**
 * utils/apiResponse.js
 * Helpers para respuestas API consistentes en todos los controllers.
 * Todos los controllers del equipo deben usar estas funciones.
 *
 * Formato estándar: { success, message, data?, errors? }
 */

function ok(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function created(res, data, message = 'Creado correctamente') {
  return ok(res, data, message, 201);
}

function badRequest(res, message = 'Solicitud inválida', errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(400).json(body);
}

function unauthorized(res, message = 'No autorizado') {
  return res.status(401).json({ success: false, message });
}

function forbidden(res, message = 'Acceso denegado') {
  return res.status(403).json({ success: false, message });
}

function notFound(res, message = 'Recurso no encontrado') {
  return res.status(404).json({ success: false, message });
}

function conflict(res, message = 'Conflicto con datos existentes') {
  return res.status(409).json({ success: false, message });
}

function unprocessable(res, errors) {
  return res.status(422).json({ success: false, message: 'Datos inválidos', errors });
}

function serverError(res, message = 'Error interno del servidor') {
  return res.status(500).json({ success: false, message });
}

module.exports = { ok, created, badRequest, unauthorized, forbidden, notFound, conflict, unprocessable, serverError };
