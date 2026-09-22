CREATE DATABASE IF NOT EXISTS `gestion_tecnicos_soldadura` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `gestion_tecnicos_soldadura`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('Administrador', 'Supervisor', 'Técnico') NOT NULL DEFAULT 'Técnico',
  `estado` ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `ultimo_acceso` DATETIME(3) NULL,
  INDEX `idx_usuarios_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `homologado` BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT `fk_tecnicos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_tecnicos_especialidad` (`especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `maquinas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_interno` VARCHAR(50) NOT NULL UNIQUE,
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(100) NOT NULL,
  `numero_serie` VARCHAR(100) NULL UNIQUE,
  `tipo` ENUM('Inversora', 'Rectificadora', 'Transformador', 'Generador', 'Multi-proceso') NOT NULL,
  `voltaje` VARCHAR(50) NOT NULL,
  `amperaje` VARCHAR(150) NOT NULL,
  `potencia` VARCHAR(50) NOT NULL,
  `ubicacion` VARCHAR(150) NOT NULL,
  `fecha_adquisicion` DATE NULL,
  `proveedor` VARCHAR(150) NOT NULL,
  `estado` ENUM('Disponible', 'Asignada', 'En mantenimiento', 'Fuera de servicio', 'Reparación', 'Baja') NOT NULL DEFAULT 'Disponible',
  `observaciones` TEXT NULL,
  INDEX `idx_maquinas_estado` (`estado`),
  INDEX `idx_maquinas_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asignaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tecnico_id` INT NULL,
  `proyecto` VARCHAR(255) NULL,
  `ubicacion` VARCHAR(255) NULL,
  `maquina_id` INT NOT NULL,
  `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_devolucion` DATETIME(3) NULL,
  `motivo` TEXT NOT NULL,
  `estado` ENUM('Activa', 'Finalizada', 'Cancelada') NOT NULL DEFAULT 'Activa',
  `usuario_responsable` VARCHAR(100) NOT NULL,
  `observaciones` TEXT NULL,
  CONSTRAINT `fk_asignaciones_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `tecnicos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_asignaciones_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_asignaciones_estado` (`estado`),
  INDEX `idx_asignaciones_tecnico_maquina` (`tecnico_id`, `maquina_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `tecnico_id` INT NULL,
  `usuario_id` INT NULL,
  FOREIGN KEY (`tecnico_id`) REFERENCES `tecnicos` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  `estado` ENUM('Programado', 'En proceso', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` TEXT NULL,
  CONSTRAINT `fk_mantenimientos_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_mantenimientos_tipo` (`tipo`),
  INDEX `idx_mantenimientos_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT `fk_contratos_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_contratos_estado` (`estado`),
  INDEX `idx_contratos_fechas` (`fecha_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `historial_maquinas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `maquina_id` INT NOT NULL,
  `tipo_evento` VARCHAR(100) NOT NULL,
  `titulo` VARCHAR(255) NULL,
  `metadata_json` JSON NULL,
  `descripcion` TEXT NOT NULL,
  `usuario_responsable` VARCHAR(100) NOT NULL,
  `fecha` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `observaciones` TEXT NULL,
  CONSTRAINT `fk_historial_maquina` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_historial_maquina_id` (`maquina_id`),
  INDEX `idx_historial_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `alertas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo` VARCHAR(100) NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `prioridad` ENUM('Información', 'Advertencia', 'Alta', 'Crítica') NOT NULL DEFAULT 'Información',
  `fecha_generacion` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `registro_id` INT NULL,
  `modulo` VARCHAR(50) NULL,
  INDEX `idx_alertas_leida` (`leida`),
  INDEX `idx_alertas_prioridad` (`prioridad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bitacora` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `usuario_nombre` VARCHAR(150) NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `modulo` VARCHAR(50) NOT NULL,
  `registro_id` INT NULL,
  `fecha` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `direccion_ip` VARCHAR(45) NOT NULL,
  `descripcion` TEXT NOT NULL,
  INDEX `idx_bitacora_usuario` (`usuario_id`),
  INDEX `idx_bitacora_modulo` (`modulo`),
  INDEX `idx_bitacora_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_lock (id INT PRIMARY KEY) ENGINE=InnoDB;
INSERT IGNORE INTO app_lock (id) VALUES (1);
