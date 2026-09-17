import {
  Usuario,
  Tecnico,
  Maquina,
  Asignacion,
  Mantenimiento,
  ContratoMantenimiento,
  HistorialMaquina,
  Alerta,
  BitacoraRegistro
} from '../shared/types';

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 1,
    nombre: 'Admin',
    apellido: 'PRODIMA',
    correo: 'admin@prodima.gt',
    username: 'admin',
    rol: 'Administrador',
    estado: 'Activo',
    fecha_creacion: '2025-01-10T08:00:00Z',
    ultimo_acceso: '2026-09-04T08:30:00Z',
    password: '$2b$10$YourHashedPasswordHerePlaceholderAdmin'
  }
];

export const INITIAL_TECNICOS: Tecnico[] = [
  {
    id: 1,
    nombre: 'David',
    apellido: 'López',
    DPI: '2489 12345 0101',
    telefono: '+502 5544-1122',
    correo: 'dlopez@prodima.gt',
    especialidad: 'Soldadura TIG (GTAW)',
    puesto: 'Especialista Técnico TIG / Inoxidables PRODIMA',
    fecha_ingreso: '2023-03-15',
    estado: 'Activo',
    usuario_id: 4,
    homologado: true
  },
  {
    id: 2,
    nombre: 'Ilsser',
    apellido: 'Guatemala',
    DPI: '1982 44332 0101',
    telefono: '+502 5911-3344',
    correo: 'iguatemalam@miumg.edu.gt',
    especialidad: 'Soldadura MIG/MAG (GMAW)',
    puesto: 'Técnico Soldador Especialista de Campo',
    fecha_ingreso: '2023-06-01',
    estado: 'Activo',
    usuario_id: 5,
    homologado: true
  },
  {
    id: 3,
    nombre: 'Mario Renald',
    apellido: 'Estrada Gómez',
    DPI: '3012 99881 0101',
    telefono: '+502 4122-8899',
    correo: 'mestrada@prodima.gt',
    especialidad: 'Soldadura Arco Eléctrico (SMAW)',
    puesto: 'Técnico de Servicio Heavy Duty & Estructuras',
    fecha_ingreso: '2022-11-10',
    estado: 'Activo',
    usuario_id: null,
    homologado: true
  },
  {
    id: 4,
    nombre: 'Byron Alexánder',
    apellido: 'Morales Alvarado',
    DPI: '1899 33221 0101',
    telefono: '+502 5333-7711',
    correo: 'bmorales@prodima.gt',
    especialidad: 'Soldadura Oxigas / Corte',
    puesto: 'Especialista en Corte Plasma & Oxicorte Victor',
    fecha_ingreso: '2021-08-20',
    estado: 'Activo',
    usuario_id: null,
    homologado: true
  },
  {
    id: 5,
    nombre: 'Edwin Francisco',
    apellido: 'Chavez Cano',
    DPI: '2211 88776 0101',
    telefono: '+502 5888-2299',
    correo: 'echavez@prodima.gt',
    especialidad: 'Soldadura Arco Sumergido (SAW)',
    puesto: 'Técnico de Taller Central Mariscal Zona 11',
    fecha_ingreso: '2024-01-12',
    estado: 'Activo',
    usuario_id: null,
    homologado: true
  }
];

export const INITIAL_MAQUINAS: Maquina[] = [
  {
    id: 1,
    codigo_interno: 'PRD-ESAB-162',
    marca: 'ESAB',
    modelo: 'Handy Arc 162i',
    numero_serie: 'ES-HA162-77291',
    tipo: 'Inversora',
    voltaje: '110V / 220V Monofásica',
    amperaje: '160A',
    potencia: '6.2 kW',
    ubicacion: 'PRODIMA Sede Central - 19 Calle Zona 11 Mariscal',
    fecha_adquisicion: '2024-01-15',
    proveedor: 'PRODIMA Guatemala (Línea Oficial ESAB)',
    estado: 'Asignada',
    observaciones: 'Equipo inversor compacto de alta eficiencia. Apto para electrodos E6013 y E7018 Kiswel de 3.25mm.'
  },
  {
    id: 2,
    codigo_interno: 'PRD-ESAB-ROG',
    marca: 'ESAB',
    modelo: 'Rogue LHN 162i',
    numero_serie: 'ES-ROG162-88120',
    tipo: 'Inversora',
    voltaje: '220V Monofásica',
    amperaje: '160A',
    potencia: '6.5 kW',
    ubicacion: 'Proyecto Aceros de Guatemala (AG Escuintla)',
    fecha_adquisicion: '2024-02-10',
    proveedor: 'PRODIMA Guatemala (Distribuidor Autorizado ESAB)',
    estado: 'Asignada',
    observaciones: 'Diseño robusto de grado industrial IP23S. Función Live TIG para acabados finos.'
  },
  {
    id: 3,
    codigo_interno: 'PRD-ESAB-EMP',
    marca: 'ESAB',
    modelo: 'Rebel EMP 215ic',
    numero_serie: 'ES-RB215-44122',
    tipo: 'Multi-proceso',
    voltaje: '120V / 230V Smart Multi-Voltage',
    amperaje: '215A',
    potencia: '7.8 kW',
    ubicacion: 'PRODIMA Bodega Central - Área Demo y Calibración',
    fecha_adquisicion: '2023-05-20',
    proveedor: 'PRODIMA Guatemala S.A.',
    estado: 'Disponible',
    observaciones: 'Tecnología sMIG ("Smart MIG") para adaptación dinámica del arco. Calibración ISO 9001 vigente.'
  },
  {
    id: 4,
    codigo_interno: 'PRD-ESAB-PLS',
    marca: 'ESAB',
    modelo: 'Handyplasma 45i',
    numero_serie: 'ES-HP45-99201',
    tipo: 'Inversora',
    voltaje: '220V Monofásica 50/60Hz',
    amperaje: '45A Plasma Cut',
    potencia: '5.5 kW',
    ubicacion: 'Taller de Mantenimiento Electrónico PRODIMA',
    fecha_adquisicion: '2023-09-12',
    proveedor: 'PRODIMA Guatemala (Corte Plasma y Oxicorte)',
    estado: 'En mantenimiento',
    observaciones: 'Corte limpio hasta 16mm en acero al carbono. En servicio técnico preventivo de antorcha.'
  },
  {
    id: 5,
    codigo_interno: 'PRD-MIL-SYN',
    marca: 'Miller',
    modelo: 'Syncrowave 300 AC/DC',
    numero_serie: 'ML-SY300-88192',
    tipo: 'Inversora',
    voltaje: '220V / 440V Trifásica Industrial',
    amperaje: '300A',
    potencia: '12 kW',
    ubicacion: 'PRODIMA Taller de Estructuras Especiales & Aluminio',
    fecha_adquisicion: '2022-04-05',
    proveedor: 'Miller Latin America / Importación PRODIMA',
    estado: 'Disponible',
    observaciones: 'Especial para aleaciones aeroespaciales, acero inoxidable grado alimenticio y tanques criogénicos.'
  },
  {
    id: 6,
    codigo_interno: 'PRD-LIN-PW3',
    marca: 'Lincoln Electric',
    modelo: 'Power Wave C300',
    numero_serie: 'LE-PWC3-99120',
    tipo: 'Multi-proceso',
    voltaje: '230V / 460V Trifásica',
    amperaje: '350A',
    potencia: '14.5 kW',
    ubicacion: 'Proyecto Cementos Progreso - San Gabriel',
    fecha_adquisicion: '2024-03-18',
    proveedor: 'Lincoln Electric Guatemala / PRODIMA Partner',
    estado: 'Asignada',
    observaciones: 'Control digital de onda Waveform Control Technology. Asignada para refuerzo de hornos rotatorios.'
  },
  {
    id: 7,
    codigo_interno: 'PRD-FRO-TS3',
    marca: 'Fronius',
    modelo: 'TransSteel 3500 Compact',
    numero_serie: 'FR-TS3500-11029',
    tipo: 'Multi-proceso',
    voltaje: '380V Trifásica',
    amperaje: '350A',
    potencia: '15 kW',
    ubicacion: 'PRODIMA Laboratorio Metrológico y Calibración',
    fecha_adquisicion: '2022-09-12',
    proveedor: 'Fronius International / Soporte PRODIMA',
    estado: 'En mantenimiento',
    observaciones: 'Sometido a calibración de amperaje y certificación de shunt bajo norma ISO 9001.'
  },
  {
    id: 8,
    codigo_interno: 'PRD-HOB-CE2',
    marca: 'Hobart',
    modelo: 'Champion Elite 225',
    numero_serie: 'HB-CE225-88201',
    tipo: 'Generador',
    voltaje: '120V / 240V Generador Auxiliar',
    amperaje: '225A',
    potencia: '10 kW Motor KOHLER',
    ubicacion: 'Cuarentena PRODIMA - Área de Motores Generadores',
    fecha_adquisicion: '2020-11-18',
    proveedor: 'PRODIMA Equipos Pesados',
    estado: 'Fuera de servicio',
    observaciones: 'Falla severa en alternador. Esperando bobinado e importación de repuesto.'
  }
];

export const INITIAL_ASIGNACIONES: Asignacion[] = [
  {
    id: 1,
    tecnico_id: 1,
    maquina_id: 1,
    fecha_asignacion: '2026-07-01T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Instalación de tuberías de acero inoxidable AISI 316L en Ingenio Pantaleon',
    estado: 'Activa',
    usuario_responsable: 'admin',
    observaciones: 'Entregada con cables de masa de 35mm², porta-electrodo de 300A y kit de electrodos Kiswel E308L.'
  },
  {
    id: 2,
    tecnico_id: 2,
    maquina_id: 2,
    fecha_asignacion: '2026-07-15T09:30:00Z',
    fecha_devolucion: null,
    motivo: 'Ensamblaje y soldadura estructural de vigas H en Aceros de Guatemala (AG Escuintla)',
    estado: 'Activa',
    usuario_responsable: 'rgarcia',
    observaciones: 'Soldadura con electrodo básico Conarco 7018 de 1/8". Equipo protegido contra sobretensiones.'
  },
  {
    id: 3,
    tecnico_id: 3,
    maquina_id: 6,
    fecha_asignacion: '2026-07-20T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Refuerzo de placas antidesgaste en tolvas de clinker - Planta San Gabriel Cementos Progreso',
    estado: 'Activa',
    usuario_responsable: 'rgarcia',
    observaciones: 'Proceso FCAW con alambre tubular para recubrimiento duro Metweld Hardfacing.'
  },
  {
    id: 4,
    tecnico_id: 4,
    maquina_id: 4,
    fecha_asignacion: '2026-08-10T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Mantenimiento preventivo y sustitución de consumibles de antorcha de corte plasma',
    estado: 'Activa',
    usuario_responsable: 'rgarcia',
    observaciones: 'Asignación directa para ejecución de orden de mantenimiento preventivo ESAB.'
  },
  {
    id: 5,
    tecnico_id: 5,
    maquina_id: 7,
    fecha_asignacion: '2026-08-01T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Mantenimiento correctivo de placa IGBT y calibración metrológica ISO 9001',
    estado: 'Activa',
    usuario_responsable: 'admin',
    observaciones: 'Asignada en taller central Mariscal para pruebas de arco y aislamiento.'
  },
  {
    id: 6,
    tecnico_id: 1,
    maquina_id: 3,
    fecha_asignacion: '2026-08-20T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Inspección de rutina y actualización de firmware sMIG de control digital',
    estado: 'Activa',
    usuario_responsable: 'admin',
    observaciones: 'Asignación directa para calibración y mantenimiento programado.'
  },
  {
    id: 7,
    tecnico_id: 2,
    maquina_id: 5,
    fecha_asignacion: '2026-08-18T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Verificación preventiva del módulo de alta frecuencia HF y bornes DINSE',
    estado: 'Activa',
    usuario_responsable: 'rgarcia',
    observaciones: 'Asignación directa al técnico para revisión técnica en taller.'
  },
  {
    id: 8,
    tecnico_id: 4,
    maquina_id: 8,
    fecha_asignacion: '2026-08-05T08:00:00Z',
    fecha_devolucion: null,
    motivo: 'Reparación correctiva de alternador y sistema de encendido motor Kohler',
    estado: 'Activa',
    usuario_responsable: 'admin',
    observaciones: 'Asignación técnica para diagnóstico y reconstrucción electromecánica.'
  }
];

export const INITIAL_MANTENIMIENTOS: Mantenimiento[] = [
  {
    id: 1,
    maquina_id: 7,
    tipo: 'Correctivo',
    descripcion: 'Reemplazo de tarjeta de control IGBT y calibración de panel digital bajo norma ISO 9001.',
    fecha_inicio: '2026-08-01',
    fecha_fin: '2026-08-18',
    costo: 3450.00,
    proveedor: 'PRODIMA Servicio Técnico Especializado (Sede Mariscal)',
    tecnico_responsable: 'Edwin Francisco Chavez Cano',
    estado: 'En proceso',
    observaciones: 'Módulo de potencia calibrado con osciloscopio y banco de carga resistivo.'
  },
  {
    id: 2,
    maquina_id: 1,
    tipo: 'Preventivo',
    descripcion: 'Mantenimiento semestral: Limpieza ultrasónica de polvo metálico, ajuste de bornes DINSE y prueba de aislamiento a 1000V.',
    fecha_inicio: '2026-06-10',
    fecha_fin: '2026-06-11',
    costo: 850.00,
    proveedor: 'PRODIMA Taller Central de Mantenimiento',
    tecnico_responsable: 'David López',
    estado: 'Finalizado',
    observaciones: 'Certificado de aislamiento y prueba de arco superados al 100% de amperaje.'
  },
  {
    id: 3,
    maquina_id: 4,
    tipo: 'Preventivo',
    descripcion: 'Cambio de consumibles de antorcha de corte plasma (tobera, electrodo, difusor) y verificación del filtro regulador de aire comprimido.',
    fecha_inicio: '2026-08-12',
    fecha_fin: '2026-08-17',
    costo: 950.00,
    proveedor: 'PRODIMA Guatemala (División Corte y Plasma)',
    tecnico_responsable: 'Byron Alexánder Morales Alvarado',
    estado: 'En proceso',
    observaciones: 'Consumibles originales ESAB Handyplasma instalados.'
  },
  {
    id: 4,
    maquina_id: 3,
    tipo: 'Preventivo',
    descripcion: 'Inspección de rutina y actualización de firmware sMIG de la ESAB Rebel EMP 215ic.',
    fecha_inicio: '2026-08-25',
    fecha_fin: '2026-08-26',
    costo: 600.00,
    proveedor: 'PRODIMA Servicios Técnicos Centrales',
    tecnico_responsable: 'David López',
    estado: 'Programado',
    observaciones: 'Mantenimiento preventivo programado antes de próxima asignación en campo.'
  },
  {
    id: 5,
    maquina_id: 2,
    tipo: 'Preventivo',
    descripcion: 'Mantenimiento preventivo y calibración de estabilidad de arco en proceso Live TIG.',
    fecha_inicio: '2026-08-15',
    fecha_fin: '2026-08-20',
    costo: 750.00,
    proveedor: 'PRODIMA Servicios Técnicos',
    tecnico_responsable: 'Ilsser Guatemala',
    estado: 'En proceso',
    observaciones: 'Revisión técnica de campo en planta Aceros de Guatemala.'
  },
  {
    id: 6,
    maquina_id: 5,
    tipo: 'Preventivo',
    descripcion: 'Inspección de circuito HF de alta frecuencia y bornes de potencia DINSE para TIG AC/DC.',
    fecha_inicio: '2026-08-28',
    fecha_fin: '2026-08-30',
    costo: 890.00,
    proveedor: 'PRODIMA Taller Especializado',
    tecnico_responsable: 'Ilsser Guatemala',
    estado: 'Programado',
    observaciones: 'Programado para calibración periódica de alta precisión.'
  },
  {
    id: 7,
    maquina_id: 6,
    tipo: 'Preventivo',
    descripcion: 'Calibración certificada Waveform Control y limpieza interna de túnel de aire refrigerante.',
    fecha_inicio: '2026-08-10',
    fecha_fin: '2026-08-14',
    costo: 1200.00,
    proveedor: 'Lincoln Electric Guatemala / PRODIMA',
    tecnico_responsable: 'Mario Renald Estrada Gómez',
    estado: 'En proceso',
    observaciones: 'Mantenimiento preventivo oficial bajo póliza de garantía.'
  },
  {
    id: 8,
    maquina_id: 8,
    tipo: 'Correctivo',
    descripcion: 'Desarme de módulo generador, bobinado de estator y reemplazo de diodos rectificadores.',
    fecha_inicio: '2026-08-05',
    fecha_fin: '2026-08-22',
    costo: 4200.00,
    proveedor: 'Servicios Industriales y Motores GT',
    tecnico_responsable: 'Byron Alexánder Morales Alvarado',
    estado: 'En proceso',
    observaciones: 'Diagnóstico correctivo y reconstrucción electromecánica.'
  }
];

export const INITIAL_CONTRATOS: ContratoMantenimiento[] = [
  {
    id: 1,
    maquina_id: 1,
    proveedor: 'PRODIMA S.A. - Póliza Integral ESAB Gold',
    numero_contrato: 'CTR-PRD-ESAB-2025-01',
    fecha_inicio: '2025-08-25',
    fecha_fin: '2026-08-28', // Próximo a vencer (12 días)
    costo: 9500.00,
    tipo_servicio: 'Garantía Integral, Calibración Certificada ISO 9001 y Repuestos Originales ESAB',
    condiciones: 'Incluye 4 calibraciones anuales con equipo patrón y atención prioritaria en 12 horas.',
    estado: 'Próximo a vencer',
    observaciones: 'URGENTE: Contrato vence en 12 días. Coordinar renovación con departamento de compras PRODIMA.'
  },
  {
    id: 2,
    maquina_id: 6,
    proveedor: 'Lincoln Electric Guatemala / PRODIMA Industrial Partner',
    numero_contrato: 'CTR-PRD-LIN-2025-08',
    fecha_inicio: '2025-09-01',
    fecha_fin: '2026-09-01', // Próximo a vencer (16 días)
    costo: 14000.00,
    tipo_servicio: 'Póliza de Calibración Avanzada Waveform Control y Mantenimiento Preventivo',
    condiciones: 'Visitas bimestrales en plantas industriales de Guatemala (Escuintla, San Gabriel, Izabal).',
    estado: 'Próximo a vencer',
    observaciones: 'Contrato de soporte técnico en planta para proyectos críticos de clientes de PRODIMA.'
  },
  {
    id: 3,
    maquina_id: 3,
    proveedor: 'PRODIMA S.A. - Soporte Técnico Sede Central',
    numero_contrato: 'CTR-PRD-DEMO-2026-04',
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    costo: 8000.00,
    tipo_servicio: 'Póliza de Mantenimiento Preventivo y Certificación de Soldabilidad',
    condiciones: 'Inspección técnica general mensual y reporte de calibración metrológica.',
    estado: 'Vigente',
    observaciones: 'Póliza vigente y auditada bajo normas de calidad ISO 9001:2015.'
  },
  {
    id: 4,
    maquina_id: 8,
    proveedor: 'Servicios Industriales y Motores GT',
    numero_contrato: 'CTR-HOB-2024-002',
    fecha_inicio: '2024-06-01',
    fecha_fin: '2025-06-01', // Ya vencido
    costo: 6500.00,
    tipo_servicio: 'Soporte Mecánico de Motores a Combustión Kohler / Generadores',
    condiciones: 'Servicio técnico por demanda ante averías mecánicas.',
    estado: 'Vencido',
    observaciones: 'PÓLIZA VENCIDA. La máquina se encuentra fuera de servicio en cuarentena PRODIMA.'
  }
];

export const INITIAL_ALERTAS: Alerta[] = [
  {
    id: 1,
    tipo: 'Contrato Próximo a Vencer',
    titulo: 'Póliza ESAB Gold Próxima a Vencer (12 días)',
    mensaje: 'El contrato CTR-PRD-ESAB-2025-01 de la máquina ESAB Handy Arc 162i (PRD-ESAB-162) vence el 28/08/2026.',
    prioridad: 'Crítica',
    fecha_generacion: '2026-08-16T07:00:00Z',
    leida: false,
    registro_id: 1,
    modulo: 'Contratos'
  },
  {
    id: 2,
    tipo: 'Contrato Próximo a Vencer',
    titulo: 'Contrato Lincoln Power Wave Próximo a Vencer (16 días)',
    mensaje: 'El contrato CTR-PRD-LIN-2025-08 de la máquina Lincoln Power Wave C300 (PRD-LIN-PW3) vence el 01/09/2026.',
    prioridad: 'Alta',
    fecha_generacion: '2026-08-16T07:00:00Z',
    leida: false,
    registro_id: 2,
    modulo: 'Contratos'
  },
  {
    id: 3,
    tipo: 'Máquina en Mantenimiento',
    titulo: 'Equipo en Mantenimiento Correctivo (PRODIMA Taller)',
    mensaje: 'La máquina Fronius TransSteel 3500 (PRD-FRO-TS3) se encuentra en proceso de calibración de amperaje.',
    prioridad: 'Advertencia',
    fecha_generacion: '2026-08-01T09:00:00Z',
    leida: true,
    registro_id: 7,
    modulo: 'Mantenimientos'
  },
  {
    id: 4,
    tipo: 'Máquina Fuera de Servicio',
    titulo: 'Motosoldadora en Cuarentena PRODIMA',
    mensaje: 'La motosoldadora Hobart Champion Elite 225 (PRD-HOB-CE2) requiere reemplazo de alternador.',
    prioridad: 'Crítica',
    fecha_generacion: '2026-07-20T10:30:00Z',
    leida: false,
    registro_id: 8,
    modulo: 'Máquinas'
  }
];

export const INITIAL_HISTORIAL: HistorialMaquina[] = [
  {
    id: 1,
    maquina_id: 1,
    tipo_evento: 'Asignación',
    descripcion: 'Asignada a Juan José López Pérez para montaje de tubería de acero inoxidable en Ingenio Pantaleon',
    usuario_responsable: 'admin',
    fecha: '2026-07-01T08:00:00Z',
    observaciones: 'Despachada desde PRODIMA Sede Central Zona 11 Mariscal con accesorios completos'
  },
  {
    id: 2,
    maquina_id: 1,
    tipo_evento: 'Mantenimiento',
    descripcion: 'Mantenimiento preventivo semestral y prueba de aislamiento ejecutada con éxito',
    usuario_responsable: 'rgarcia',
    fecha: '2026-06-11T16:00:00Z',
    observaciones: 'Certificado de calibración emitido según protocolo ISO 9001 de PRODIMA'
  },
  {
    id: 3,
    maquina_id: 2,
    tipo_evento: 'Asignación',
    descripcion: 'Asignada a Mario Renald Estrada Gómez para ensamblaje de vigas pesadas en Aceros de Guatemala',
    usuario_responsable: 'rgarcia',
    fecha: '2026-07-15T09:30:00Z',
    observaciones: 'Operación con electrodo Kiswel E7018 bajo supervisión de calidad'
  },
  {
    id: 4,
    maquina_id: 7,
    tipo_evento: 'Cambio de Estado',
    descripcion: 'Ingresada a "En mantenimiento" para calibración en laboratorio metrológico PRODIMA',
    usuario_responsable: 'admin',
    fecha: '2026-08-01T09:00:00Z',
    observaciones: 'Verificación de shunt y curvas de pulso'
  }
];

export const INITIAL_BITACORA: BitacoraRegistro[] = [
  {
    id: 1,
    usuario_id: 1,
    usuario_nombre: 'Carlos Mendoza (admin@prodimagt.com)',
    accion: 'LOGIN_PRODIMA_ERP',
    modulo: 'Autenticación',
    registro_id: null,
    fecha: '2026-08-16T08:30:00Z',
    direccion_ip: '190.56.24.110 (Guatemala)',
    descripcion: 'Inicio de sesión exitoso en el ERP Industrial de PRODIMA Guatemala.'
  },
  {
    id: 2,
    usuario_id: 2,
    usuario_nombre: 'Ing. Roberto García (rgarcia@prodimagt.com)',
    accion: 'CREAR_ASIGNACION_CAMPO',
    modulo: 'Asignaciones',
    registro_id: 3,
    fecha: '2026-07-20T08:00:00Z',
    direccion_ip: '190.56.24.115 (PRODIMA Red Central)',
    descripcion: 'Asignó la máquina PRD-LIN-PW3 a Byron Morales para proyecto en Planta Cementos Progreso.'
  },
  {
    id: 3,
    usuario_id: 1,
    usuario_nombre: 'Carlos Mendoza (admin@prodimagt.com)',
    accion: 'INGRESO_MANTENIMIENTO_ISO9001',
    modulo: 'Mantenimientos',
    registro_id: 1,
    fecha: '2026-08-01T09:00:00Z',
    direccion_ip: '190.56.24.110 (Guatemala)',
    descripcion: 'Registró orden de mantenimiento correctivo y calibración para equipo PRD-FRO-TS3.'
  },
  {
    id: 4,
    usuario_id: 1,
    usuario_nombre: 'Carlos Mendoza (admin@prodimagt.com)',
    accion: 'AUDITORIA_ALERTAS_PRODIMA',
    modulo: 'Alertas',
    registro_id: null,
    fecha: '2026-08-16T07:00:00Z',
    direccion_ip: '127.0.0.1 (PRODIMA Daemon)',
    descripcion: 'Ejecución automática del motor de auditoría preventiva y contratos por vencer en PRODIMA.'
  }
];
