-- ============================================================
-- SCRIPT DE DATOS INICIALES (SEED DATA)
-- BASE DE DATOS: gestion_tecnicos_soldadura
-- ============================================================

USE `gestion_tecnicos_soldadura`;

-- Insertar Roles
INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total y control absoluto del sistema'),
(2, 'Supervisor', 'Gestión operativa, asignaciones, mantenimientos y reportes'),
(3, 'Técnico', 'Consulta de máquinas asignadas y registro de actividades autorizadas');

-- Insertar Usuarios (Contraseñas Hasheadas con bcrypt)
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `correo`, `username`, `password_hash`, `rol`, `estado`, `fecha_creacion`) VALUES
(1, 'Carlos', 'Mendoza', 'admin@soldadura.ind.gt', 'admin', '$2b$12$e8v1A0gTfS2x9k.2u1v0eeG3aP4qO5r6s7t8u9v0w1x2y3z4a5b6c', 'Administrador', 'Activo', '2025-01-10 08:00:00'),
(2, 'Ing. Roberto', 'García', 'rgarcia@soldadura.ind.gt', 'rgarcia', '$2b$12$e8v1A0gTfS2x9k.2u1v0eeG3aP4qO5r6s7t8u9v0w1x2y3z4a5b6c', 'Supervisor', 'Activo', '2025-01-15 09:15:00'),
(3, 'Juan José', 'López', 'jlopez@soldadura.ind.gt', 'jlopez', '$2b$12$e8v1A0gTfS2x9k.2u1v0eeG3aP4qO5r6s7t8u9v0w1x2y3z4a5b6c', 'Técnico', 'Activo', '2025-02-01 10:00:00'),
(4, 'Mario Renald', 'Estrada', 'mestrada@soldadura.ind.gt', 'mestrada', '$2b$12$e8v1A0gTfS2x9k.2u1v0eeG3aP4qO5r6s7t8u9v0w1x2y3z4a5b6c', 'Técnico', 'Activo', '2025-02-10 11:00:00');

-- Insertar Técnicos
INSERT INTO `tecnicos` (`id`, `nombre`, `apellido`, `DPI`, `telefono`, `correo`, `especialidad`, `puesto`, `fecha_ingreso`, `estado`, `usuario_id`) VALUES
(1, 'Juan José', 'López Pérez', '2489123450101', '+502 5544-1122', 'jlopez@soldadura.ind.gt', 'Soldadura TIG (GTAW)', 'Técnico Especialista A', '2023-03-15', 'Activo', 3),
(2, 'Mario Renald', 'Estrada Gómez', '1982443320101', '+502 5911-3344', 'mestrada@soldadura.ind.gt', 'Soldadura MIG/MAG (GMAW)', 'Técnico Soldador B', '2023-06-01', 'Activo', 4),
(3, 'Byron Alexánder', 'Morales Alvarado', '3012998810101', '+502 4122-8899', 'bmorales@soldadura.ind.gt', 'Soldadura Arco Eléctrico (SMAW)', 'Técnico Industrial Heavy Duty', '2022-11-10', 'Activo', NULL),
(4, 'Gustavo Adolfo', 'Ramírez Soto', '1899332210101', '+502 5333-7711', 'gramirez@soldadura.ind.gt', 'Soldadura Tubular (FCAW)', 'Técnico Soldador Senior', '2021-08-20', 'Activo', NULL);

-- Insertar Máquinas de Soldar
INSERT INTO `maquinas` (`id`, `codigo_interno`, `marca`, `modelo`, `numero_serie`, `tipo`, `voltaje`, `amperaje`, `potencia`, `ubicacion`, `fecha_adquisicion`, `proveedor`, `estado`, `observaciones`) VALUES
(1, 'MS-2024-001', 'Miller', 'Syncrowave 300', 'ML-SY300-88192', 'Inversora', '220V / 440V Trifásica', '300A', '12 kW', 'Nave Industrial A - Taller de Estructura', '2024-01-15', 'Equipos Industriales S.A.', 'Asignada', 'Equipo en óptimas condiciones. Incluye antorcha TIG refrigerada por agua.'),
(2, 'MS-2024-002', 'Lincoln Electric', 'Power Wave C300', 'LE-PWC3-99120', 'Multi-proceso', '230V / 460V', '350A', '14.5 kW', 'Nave Industrial B - Subensambles', '2024-02-10', 'Lincoln Guatemala R.L.', 'Asignada', 'Alimentador de alambre automático de 4 rodillos incorporado.'),
(3, 'MS-2023-008', 'ESAB', 'Rebel EMP 215ic', 'ES-RB215-44122', 'Inversora', '120V / 230V Monofásica', '220A', '7.8 kW', 'Bodega Central de Equipos', '2023-05-20', 'Soluciones Mecánicas GT', 'Disponible', 'Listo para asignación inmediata. Mantenimiento preventivo reciente.'),
(4, 'MS-2022-015', 'Fronius', 'TransSteel 3500 Compact', 'FR-TS3500-11029', 'Multi-proceso', '380V Trifásica', '350A', '15 kW', 'Área de Mantenimiento / Taller Mecánico', '2022-09-12', 'Fronius Internacional', 'En mantenimiento', 'Sometido a calibración de amperaje y reemplazo de tarjeta de control.'),
(5, 'MS-2021-003', 'Kemppi', 'MasterTig 235ACDC', 'KM-MT235-00128', 'Transformador', '220V', '230A', '8.5 kW', 'Taller de Soldadura de Aluminio', '2021-04-05', 'Equipos Industriales S.A.', 'Disponible', 'Especial para soldadura en aleaciones de aluminio.'),
(6, 'MS-2020-009', 'Hobart', 'Champion Elite 225', 'HB-CE225-88201', 'Generador', '120V / 240V Generador Auxiliar', '225A', '10 kW Motor KOHLER', 'Cuarentena / Reparaciones Externas', '2020-11-18', 'TecniSoldadura GT', 'Fuera de servicio', 'Falla severa en estator del generador. Esperando repuesto de importación.');

-- Insertar Asignaciones
INSERT INTO `asignaciones` (`id`, `tecnico_id`, `maquina_id`, `fecha_asignacion`, `fecha_devolucion`, `motivo`, `estado`, `usuario_responsable`, `observaciones`) VALUES
(1, 1, 1, '2026-07-01 08:00:00', NULL, 'Fabricación de estructuras de acero inoxidable para tubería de proceso', 'Activa', 'admin', 'Entregada con kit completo de antorcha TIG y regulador de Argón.'),
(2, 2, 2, '2026-07-15 09:30:00', NULL, 'Ensamblaje de vigas H en Nave B', 'Activa', 'rgarcia', 'Proceso MIG con mezcla 80/20 Ar/CO2.');

-- Insertar Mantenimientos
INSERT INTO `mantenimientos` (`id`, `maquina_id`, `tipo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `costo`, `proveedor`, `tecnico_responsable`, `estado`, `observaciones`) VALUES
(1, 4, 'Correctivo', 'Cambio de tarjeta de regulación de corriente y calibración de panel frontal.', '2026-08-01', '2026-08-12', 3450.00, 'Servicio Técnico Fronius GT', 'Ing. Fernando Ruiz', 'En proceso', 'Repuesto importado instalado, realizando pruebas de carga eléctrica.'),
(2, 1, 'Preventivo', 'Limpieza de ductos de ventilación, cambio de conectores DINSE y prueba de aislamiento.', '2026-06-10', '2026-06-11', 850.00, 'Taller Interno de Mantenimiento', 'Mario Renald Estrada', 'Finalizado', 'Mantenimiento semestral superado satisfactoriamente.');

-- Insertar Contratos de Mantenimiento
INSERT INTO `contratos_mantenimiento` (`id`, `maquina_id`, `proveedor`, `numero_contrato`, `fecha_inicio`, `fecha_fin`, `costo`, `tipo_servicio`, `condiciones`, `estado`, `observaciones`) VALUES
(1, 1, 'Miller Latin America Services', 'CTR-MIL-2025-091', '2025-08-15', '2026-08-15', 12500.00, 'Mantenimiento Integral con Repuestos Originales', 'Incluye 4 visitas preventivas al año', 'Próximo a vencer', 'URGENTE: Contrato vence en 7 días.'),
(2, 2, 'Lincoln Electric Guatemala', 'CTR-LE-2025-104', '2025-09-01', '2026-08-28', 14000.00, 'Garantía Extendida y Calibración Anual Certificada ISO 9001', 'Visitas bimestrales y atenciones por falla', 'Próximo a vencer', 'Contrato próximo a vencer en 20 días.');

-- Insertar Bitácora
INSERT INTO `bitacora` (`id`, `usuario_id`, `usuario_nombre`, `accion`, `modulo`, `registro_id`, `fecha`, `direccion_ip`, `descripcion`) VALUES
(1, 1, 'Carlos Mendoza (admin)', 'LOGIN', 'Autenticación', NULL, '2026-08-08 07:30:00', '192.168.1.105', 'Inicio de sesión exitoso en el sistema.'),
(2, 2, 'Ing. Roberto García (rgarcia)', 'CREAR_ASIGNACION', 'Asignaciones', 2, '2026-07-15 09:30:00', '192.168.1.112', 'Asignó la máquina MS-2024-002 al técnico Mario Renald Estrada Gómez.');
