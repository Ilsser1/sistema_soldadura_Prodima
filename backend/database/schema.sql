-- ============================================================
-- BASE DE DATOS: gestion_tecnicos_soldadura
-- Motor: MySQL 8.0+
-- Tesis / Sistema de Gestión de Técnicos y Máquinas de Soldar
-- ============================================================

CREATE DATABASE IF NOT EXISTS `gestion_tecnicos_soldadura` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `gestion_tecnicos_soldadura`;

-- ------------------------------------------------------------
-- Tabla 1: ROLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 2: PERMISOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `permisos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `modulo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 3: USUARIOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('Administrador', 'Supervisor', 'Técnico') NOT NULL DEFAULT 'Técnico',
  `estado` ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` DATETIME NULL,
  INDEX `idx_usuarios_username` (`username`),
  INDEX `idx_usuarios_correo` (`correo`),
  INDEX `idx_usuarios_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 4: TÉCNICOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tecnicos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `DPI` VARCHAR(20) NOT NULL UNIQUE,
  `telefono` VARCHAR(20) NOT NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE,
  `especialidad` VARCHAR(100) NOT NULL,
  `puesto` VARCHAR(100) NOT NULL,
  `fecha_ingreso` DATE NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  `usuario_id` INT NULL UNIQUE,
  CONSTRAINT `fk_tecnicos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_tecnicos_dpi` (`DPI`),
  INDEX `idx_tecnicos_especialidad` (`especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 5: MÁQUINAS DE SOLDAR
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `maquinas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_interno` VARCHAR(50) NOT NULL UNIQUE,
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(100) NOT NULL,
  `numero_serie` VARCHAR(100) NOT NULL UNIQUE,
  `tipo` ENUM('Inversora', 'Rectificadora', 'Transformador', 'Generador', 'Multi-proceso') NOT NULL,
  `voltaje` VARCHAR(50) NOT NULL,
  `amperaje` VARCHAR(50) NOT NULL,
  `potencia` VARCHAR(50) NOT NULL,
  `ubicacion` VARCHAR(150) NOT NULL,
  `fecha_adquisicion` DATE NOT NULL,
  `proveedor` VARCHAR(150) NOT NULL,
  `estado` ENUM('Disponible', 'Asignada', 'En mantenimiento', 'Fuera de servicio', 'Reparación', 'Baja') NOT NULL DEFAULT 'Disponible',
  `observaciones` TEXT NULL,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_maquinas_codigo` (`codigo_interno`),
  INDEX `idx_maquinas_estado` (`estado`),
  INDEX `idx_maquinas_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 6: ASIGNACIONES DE MÁQUINAS A TÉCNICOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `asignaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tecnico_id` INT NOT NULL,
  `maquina_id` INT NOT NULL,
  `fecha_asignacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` DATETIME NULL,
  `motivo` TEXT NOT NULL,
  `estado` ENUM('Activa', 'Finalizada', 'Cancelada') NOT NULL DEFAULT 'Activa',
  `usuario_responsable` VARCHAR(100) NOT NULL,
  `observaciones` TEXT NULL,
  CONSTRAINT `fk_asignaciones_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `tecnicos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_asignaciones_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_asignaciones_estado` (`estado`),
  INDEX `idx_asignaciones_tecnico_maquina` (`tecnico_id`, `maquina_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 7: MANTENIMIENTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mantenimientos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `maquina_id` INT NOT NULL,
  `tipo` ENUM('Preventivo', 'Correctivo') NOT NULL,
  `descripcion` TEXT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `costo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `proveedor` VARCHAR(150) NOT NULL,
  `tecnico_responsable` VARCHAR(150) NOT NULL,
  `estado` ENUM('Programado', 'En proceso', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` TEXT NULL,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mantenimientos_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_mantenimientos_tipo` (`tipo`),
  INDEX `idx_mantenimientos_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 8: CONTRATOS DE MANTENIMIENTO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contratos_mantenimiento` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `maquina_id` INT NOT NULL,
  `proveedor` VARCHAR(150) NOT NULL,
  `numero_contrato` VARCHAR(100) NOT NULL UNIQUE,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `costo` DECIMAL(12, 2) NOT NULL,
  `tipo_servicio` VARCHAR(255) NOT NULL,
  `condiciones` TEXT NOT NULL,
  `estado` ENUM('Vigente', 'Próximo a vencer', 'Vencido', 'Cancelado') NOT NULL DEFAULT 'Vigente',
  `observaciones` TEXT NULL,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_contratos_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_contratos_numero` (`numero_contrato`),
  INDEX `idx_contratos_estado` (`estado`),
  INDEX `idx_contratos_fechas` (`fecha_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 9: HISTORIAL DE MÁQUINAS (TRAZABILIDAD COMPLETA)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historial_maquinas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `maquina_id` INT NOT NULL,
  `tipo_evento` ENUM('Asignación', 'Devolución', 'Mantenimiento', 'Cambio de Estado', 'Reparación', 'Movimiento') NOT NULL,
  `descripcion` TEXT NOT NULL,
  `usuario_responsable` VARCHAR(100) NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `observaciones` TEXT NULL,
  CONSTRAINT `fk_historial_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_historial_maquina_id` (`maquina_id`),
  INDEX `idx_historial_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 10: ALERTAS AUTOMÁTICAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `alertas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo` VARCHAR(100) NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `prioridad` ENUM('Información', 'Advertencia', 'Alta', 'Crítica') NOT NULL DEFAULT 'Información',
  `fecha_generacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `registro_id` INT NULL,
  `modulo` VARCHAR(50) NULL,
  INDEX `idx_alertas_leida` (`leida`),
  INDEX `idx_alertas_prioridad` (`prioridad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 11: BITÁCORA DEL SISTEMA (AUDITORÍA SEGURA)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bitacora` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `usuario_nombre` VARCHAR(150) NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `modulo` VARCHAR(50) NOT NULL,
  `registro_id` INT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `direccion_ip` VARCHAR(45) NOT NULL,
  `descripcion` TEXT NOT NULL,
  INDEX `idx_bitacora_usuario` (`usuario_id`),
  INDEX `idx_bitacora_modulo` (`modulo`),
  INDEX `idx_bitacora_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 12: REPORTES GENERADOS (HISTÓRICO)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reportes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `filtro_aplicado` TEXT NULL,
  `usuario_id` INT NOT NULL,
  `fecha_generacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `formato` ENUM('PDF', 'Excel', 'CSV') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
