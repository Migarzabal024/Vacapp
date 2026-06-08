-- ═══════════════════════════════════════════════════════════════
--  VacApp · Migration: DOCUMENTOS_KYC
--  VMG-61 · Crear entidad Documento_KYC en el modelo de datos
--  Sprint 2 — Desarrollo Inicial
--  Autor: Emanuel Gonzalo Feijoo
--
--  Compatible con: MariaDB 10.4+ / MySQL 8+
--
--  NOTAS PARA EL EQUIPO:
--  · Un usuario puede tener MÚLTIPLES documentos (1:N con USUARIOS)
--  · Se requieren los 4 tipos para que el admin pueda aprobar el KYC:
--      dni_frente, dni_dorso, constancia_cuit, titulo
--  · estado_auditoria es por DOCUMENTO (no confundir con estado_kyc del usuario)
--  · El admin actualiza estado_auditoria de cada doc → VMG-57 (otro miembro)
--  · Cuando todos los docs están 'aprobado', el admin cambia estado_kyc
--    del usuario a 'aprobado' en la tabla USUARIOS
--  · url_archivo: la app guarda la URL del archivo en storage (AWS/GCP/local)
--    El archivo físico NO se guarda en la BD
--  · comentario_auditoria: texto libre que el admin escribe al rechazar un doc
-- ═══════════════════════════════════════════════════════════════

USE vacapp;

CREATE TABLE IF NOT EXISTS DOCUMENTOS_KYC (
  id_documento          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  id_usuario            INT UNSIGNED   NOT NULL,
  tipo_documento        ENUM(
                          'dni_frente',
                          'dni_dorso',
                          'constancia_cuit',
                          'titulo'
                        )              NOT NULL,
  url_archivo           VARCHAR(500)   NOT NULL  COMMENT 'URL en storage (AWS S3 / GCP / local)',
  estado_auditoria      ENUM(
                          'pendiente',
                          'aprobado',
                          'rechazado'
                        )              NOT NULL  DEFAULT 'pendiente',
  comentario_auditoria  TEXT           NULL      COMMENT 'Feedback del admin al rechazar',
  fecha_subida          DATETIME       NOT NULL  DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_documento),
  INDEX idx_usuario     (id_usuario),
  INDEX idx_estado      (estado_auditoria),
  INDEX idx_tipo        (tipo_documento),

  CONSTRAINT fk_kyc_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS(id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
