-- ═══════════════════════════════════════════════
--  VacApp — Schema MySQL
--  Versión corregida y optimizada
--  Cambios respecto al diagrama original:
--    ✅ Eliminado: facilidad_parto de RESULTADOS_CRIA
--    ✅ Agregado: tabla ADMINS separada
--    ✅ IP: guardada en REGISTROS_TYC y TRANSACCIONES
--    ✅ Índices en todas las FK y columnas de búsqueda
--    ✅ Constraints de integridad referencial
--    ✅ ENUM en lugar de strings libres para estados
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS vacapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vacapp;

-- ── 1. USUARIOS ──────────────────────────────────────────────────────────────
CREATE TABLE USUARIOS (
  id_usuario       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre_completo  VARCHAR(150)    NOT NULL,
  email            VARCHAR(255)    NOT NULL,
  password_hash    VARCHAR(255)    NOT NULL,
  dni              VARCHAR(20)     NOT NULL,
  cuit_cuil        VARCHAR(20)     NOT NULL,
  rol              ENUM('productor','admin') NOT NULL DEFAULT 'productor',
  estado_kyc       ENUM('no_verificado','pendiente','aprobado','bloqueado')
                                   NOT NULL DEFAULT 'no_verificado',
  fecha_registro   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_email    (email),
  UNIQUE KEY uq_dni      (dni),
  UNIQUE KEY uq_cuit     (cuit_cuil),
  INDEX idx_rol          (rol),
  INDEX idx_estado_kyc   (estado_kyc)
) ENGINE=InnoDB;

-- ── 2. ADMINS ────────────────────────────────────────────────────────────────
--  Tabla separada para el perfil extendido del administrador.
--  Relación 1:1 con USUARIOS donde rol = 'admin'.
CREATE TABLE ADMINS (
  id_admin         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  id_usuario       INT UNSIGNED    NOT NULL,
  nivel_acceso     ENUM('super','moderador','soporte') NOT NULL DEFAULT 'moderador',
  puede_bloquear   TINYINT(1)      NOT NULL DEFAULT 1,
  puede_aprobar_kyc TINYINT(1)     NOT NULL DEFAULT 1,
  puede_ver_reportes TINYINT(1)    NOT NULL DEFAULT 1,
  fecha_alta       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo           TINYINT(1)      NOT NULL DEFAULT 1,
  PRIMARY KEY (id_admin),
  UNIQUE KEY uq_id_usuario (id_usuario),
  CONSTRAINT fk_admins_usuario
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 3. DOCUMENTOS_KYC ────────────────────────────────────────────────────────
CREATE TABLE DOCUMENTOS_KYC (
  id_documento       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_usuario         INT UNSIGNED  NOT NULL,
  tipo_documento     ENUM('dni_frente','dni_dorso','constancia_cuit','titulo')
                                   NOT NULL,
  url_archivo        VARCHAR(500)  NOT NULL COMMENT 'Link Bucket AWS/GCP',
  estado_auditoria   ENUM('pendiente','aprobado','rechazado')
                                   NOT NULL DEFAULT 'pendiente',
  comentario_auditoria TEXT        NULL     COMMENT 'Feedback del admin',
  fecha_subida       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_documento),
  INDEX idx_usuario  (id_usuario),
  INDEX idx_estado   (estado_auditoria),
  CONSTRAINT fk_kyc_usuario
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 4. PUBLICACIONES ─────────────────────────────────────────────────────────
CREATE TABLE PUBLICACIONES (
  id_publicacion       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  id_vendedor          INT UNSIGNED    NOT NULL,
  titulo               VARCHAR(200)    NOT NULL,
  raza                 VARCHAR(100)    NOT NULL,
  precio               DECIMAL(12,2)   NOT NULL,
  edad_meses           SMALLINT UNSIGNED NOT NULL,
  historial_reproductivo TEXT          NULL,
  proyeccion_genetica    TEXT          NULL COMMENT 'Datos matemáticos DEP/EBV',
  estado               ENUM('activa','pausada','bajada')
                                       NOT NULL DEFAULT 'activa',
  fecha_publicacion    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_publicacion),
  INDEX idx_vendedor   (id_vendedor),
  INDEX idx_estado     (estado),
  INDEX idx_raza       (raza),
  INDEX idx_precio     (precio),
  CONSTRAINT fk_pub_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES USUARIOS(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 5. IMAGENES_PUBLICACION ───────────────────────────────────────────────────
CREATE TABLE IMAGENES_PUBLICACION (
  id_imagen        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_publicacion   INT UNSIGNED  NOT NULL,
  url_imagen       VARCHAR(500)  NOT NULL COMMENT 'Link Bucket AWS/GCP',
  es_portada       TINYINT(1)    NOT NULL DEFAULT 0,
  orden            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id_imagen),
  INDEX idx_publicacion (id_publicacion),
  CONSTRAINT fk_img_publicacion
    FOREIGN KEY (id_publicacion) REFERENCES PUBLICACIONES(id_publicacion)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 6. REGISTROS_TYC ─────────────────────────────────────────────────────────
--  IP guardada aquí como evidencia legal de aceptación de TyC.
CREATE TABLE REGISTROS_TYC (
  id_registro      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_usuario       INT UNSIGNED  NOT NULL,
  version_tyc      VARCHAR(20)   NOT NULL COMMENT 'Ej: v1.2',
  ip_aceptacion    VARCHAR(45)   NOT NULL COMMENT 'IPv4 o IPv6 — Evidencia Legal',
  user_agent       VARCHAR(500)  NULL     COMMENT 'Evidencia Legal adicional',
  timestamp_aceptacion DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  contexto         ENUM('registro','publicacion') NOT NULL,
  PRIMARY KEY (id_registro),
  INDEX idx_usuario (id_usuario),
  CONSTRAINT fk_tyc_usuario
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 7. TRANSACCIONES ─────────────────────────────────────────────────────────
--  IP del comprador guardada como evidencia legal del cierre in situ.
CREATE TABLE TRANSACCIONES (
  id_transaccion         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  id_publicacion         INT UNSIGNED   NOT NULL,
  id_comprador           INT UNSIGNED   NOT NULL,
  id_vendedor            INT UNSIGNED   NOT NULL,
  monto_garantia         DECIMAL(12,2)  NOT NULL,
  estado                 ENUM('reserva','qr_generado','qr_escaneado','disputada')
                                        NOT NULL DEFAULT 'reserva',
  codigo_qr              VARCHAR(255)   NULL UNIQUE COMMENT 'Token único in situ',
  tyc_aceptados          TINYINT(1)     NOT NULL DEFAULT 0 COMMENT 'Evidencia Legal',
  ip_aceptacion_comprador VARCHAR(45)   NULL COMMENT 'IPv4 o IPv6 — Evidencia Legal',
  user_agent_comprador   VARCHAR(500)   NULL COMMENT 'Evidencia Legal adicional',
  timestamp_aceptacion   DATETIME       NULL COMMENT 'Evidencia Legal',
  timestamp_cierre_qr    DATETIME       NULL COMMENT 'Evidencia In Situ',
  token_pago_baas        VARCHAR(255)   NULL COMMENT 'PCI Compliance BaaS',
  fecha_creacion         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_transaccion),
  INDEX idx_publicacion  (id_publicacion),
  INDEX idx_comprador    (id_comprador),
  INDEX idx_vendedor     (id_vendedor),
  INDEX idx_estado       (estado),
  CONSTRAINT fk_trans_publicacion
    FOREIGN KEY (id_publicacion) REFERENCES PUBLICACIONES(id_publicacion)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_trans_comprador
    FOREIGN KEY (id_comprador) REFERENCES USUARIOS(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_trans_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES USUARIOS(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 8. RESULTADOS_CRIA ────────────────────────────────────────────────────────
--  ✅ facilidad_parto ELIMINADO (era redundante con proyeccion_genetica)
CREATE TABLE RESULTADOS_CRIA (
  id_resultado       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_transaccion     INT UNSIGNED  NOT NULL,
  id_comprador       INT UNSIGNED  NOT NULL,
  fecha_reporte      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  peso_nacimiento    DECIMAL(6,2)  NULL COMMENT 'kg',
  comentarios        TEXT          NULL,
  estado_verificacion ENUM('pendiente','validado') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (id_resultado),
  INDEX idx_transaccion (id_transaccion),
  INDEX idx_comprador   (id_comprador),
  CONSTRAINT fk_cria_transaccion
    FOREIGN KEY (id_transaccion) REFERENCES TRANSACCIONES(id_transaccion)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cria_comprador
    FOREIGN KEY (id_comprador) REFERENCES USUARIOS(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── 9. AUDITORIA_ADMIN ────────────────────────────────────────────────────────
CREATE TABLE AUDITORIA_ADMIN (
  id_log             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_admin           INT UNSIGNED  NOT NULL COMMENT 'FK a USUARIOS donde rol=admin',
  accion             VARCHAR(100)  NOT NULL COMMENT 'Ej: aprobar_kyc, bloquear_usuario',
  tabla_afectada     VARCHAR(50)   NULL,
  id_registro_afectado INT UNSIGNED NULL COMMENT 'ID del doc o publicación',
  justificacion      TEXT          NULL COMMENT 'Por qué el admin tomó esta decisión',
  ip_admin           VARCHAR(45)   NULL COMMENT 'IPv4 o IPv6',
  user_agent_admin   VARCHAR(500)  NULL,
  fecha_accion       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_log),
  INDEX idx_admin    (id_admin),
  INDEX idx_accion   (accion),
  INDEX idx_fecha    (fecha_accion),
  CONSTRAINT fk_audit_admin
    FOREIGN KEY (id_admin) REFERENCES USUARIOS(id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
