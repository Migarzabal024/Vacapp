-- ═══════════════════════════════════════════════════════════════
--  VacApp · Migration: USUARIOS
--  VMG-41 · Creación de la tabla de usuarios en la base de datos
--  Sprint 2 — Desarrollo Inicial
--  Autor: Emanuel Gonzalo Feijoo
--
--  Compatible con: MariaDB 10.4+ / MySQL 8+
--  Ejecutar con:   node src/config/initDb.js
--                  O importar directo desde XAMPP phpMyAdmin
--
--  NOTAS PARA EL EQUIPO:
--  · estado_kyc es el campo central que desbloquea operaciones.
--    Sus valores son: no_verificado → pendiente → aprobado | bloqueado
--  · La tabla ADMINS extiende USUARIOS en relación 1:1 (rol = 'admin')
--  · DOCUMENTOS_KYC referencia esta tabla (FK: id_usuario)
--  · PUBLICACIONES referencia esta tabla (FK: id_vendedor)
--  · TRANSACCIONES referencia esta tabla (FK: id_comprador, id_vendedor)
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS vacapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vacapp;

-- ── USUARIOS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS USUARIOS (
  id_usuario       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre_completo  VARCHAR(150)    NOT NULL,
  email            VARCHAR(255)    NOT NULL,
  password_hash    VARCHAR(255)    NOT NULL,
  dni              VARCHAR(20)     NOT NULL,
  cuit_cuil        VARCHAR(20)     NOT NULL,
  rol              ENUM('productor','admin')
                                   NOT NULL DEFAULT 'productor',
  estado_kyc       ENUM('no_verificado','pendiente','aprobado','bloqueado')
                                   NOT NULL DEFAULT 'no_verificado',
  fecha_registro   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY      (id_usuario),
  UNIQUE KEY uq_email   (email),
  UNIQUE KEY uq_dni     (dni),
  UNIQUE KEY uq_cuit    (cuit_cuil),
  INDEX idx_rol         (rol),
  INDEX idx_estado_kyc  (estado_kyc)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ── ADMINS (extiende USUARIOS donde rol = 'admin') ────────────────────────────
CREATE TABLE IF NOT EXISTS ADMINS (
  id_admin           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_usuario         INT UNSIGNED  NOT NULL,
  nivel_acceso       ENUM('super','moderador','soporte')
                                   NOT NULL DEFAULT 'moderador',
  puede_bloquear     TINYINT(1)    NOT NULL DEFAULT 1,
  puede_aprobar_kyc  TINYINT(1)    NOT NULL DEFAULT 1,
  puede_ver_reportes TINYINT(1)    NOT NULL DEFAULT 1,
  fecha_alta         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo             TINYINT(1)    NOT NULL DEFAULT 1,

  PRIMARY KEY (id_admin),
  UNIQUE KEY uq_id_usuario (id_usuario),
  CONSTRAINT fk_admins_usuario
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
