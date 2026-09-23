export type RolUsuario = 'Administrador' | 'Supervisor' | 'Técnico';
export type EstadoUsuario = 'Activo' | 'Inactivo';
export type TipoMaquina = 'Inversora' | 'Rectificadora' | 'Transformador' | 'Generador' | 'Multi-proceso';
export type EstadoMaquina = 'Disponible' | 'Asignada' | 'En mantenimiento' | 'Fuera de servicio' | 'Reparación' | 'Baja';
export type EspecialidadTecnico = string;
export type EstadoAsignacion = 'Activa' | 'Finalizada' | 'Cancelada';
export type TipoMantenimiento = 'Preventivo' | 'Correctivo';
export type EstadoMantenimiento = 'Programado' | 'En proceso' | 'Finalizado' | 'Cancelado';
export type EstadoContrato = 'Vigente' | 'Próximo a vencer' | 'Vencido' | 'Cancelado';
export type PrioridadAlerta = 'Información' | 'Advertencia' | 'Alta' | 'Crítica';
export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    username: string;
    password?: string;
    rol: RolUsuario;
    estado: EstadoUsuario;
    fecha_creacion: string;
    ultimo_acceso?: string;
}
export interface Tecnico {
    id: number;
    nombre: string;
    apellido: string;
    DPI: string;
    telefono: string;
    correo: string;
    especialidad: EspecialidadTecnico;
    puesto: string;
    fecha_ingreso: string;
    estado: EstadoUsuario;
    usuario_id?: number | null;
    usuario_username?: string;
    homologado?: boolean;
    maquinas_asignadas_count?: number;
    mantenimientos_count?: number;
}
export interface Maquina {
    id: number;
    codigo_interno: string;
    marca: string;
    modelo: string;
    numero_serie: string;
    tipo: TipoMaquina;
    voltaje: string;
    amperaje: string;
    potencia: string;
    ubicacion: string;
    fecha_adquisicion: string;
    proveedor: string;
    estado: EstadoMaquina;
    observaciones?: string;
    tecnico_actual?: string;
}
export interface Asignacion {
    id: number;
    tecnico_id: number;
    maquina_id: number;
    fecha_asignacion: string;
    fecha_devolucion?: string | null;
    motivo: string;
    estado: EstadoAsignacion;
    usuario_responsable: string;
    observaciones?: string;
    tecnico_nombre?: string;
    maquina_codigo?: string;
    maquina_marca_modelo?: string;
    proyecto?: string;
    ubicacion?: string;
}
export interface Mantenimiento {
    id: number;
    maquina_id: number;
    tipo: TipoMantenimiento;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    costo: number;
    proveedor: string;
    tecnico_responsable: string;
    tecnico_id?: number;
    usuario_id?: number;
    estado: EstadoMantenimiento;
    observaciones?: string;
    maquina_codigo?: string;
}
export interface ContratoMantenimiento {
    id: number;
    maquina_id: number;
    proveedor: string;
    numero_contrato: string;
    fecha_inicio: string;
    fecha_fin: string;
    costo: number;
    tipo_servicio: string;
    condiciones: string;
    estado: EstadoContrato;
    observaciones?: string;
    dias_restantes?: number;
    mensaje_vencimiento?: string;
    maquina_codigo?: string;
}
export interface Alerta {
    id: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    prioridad: PrioridadAlerta;
    fecha_generacion: string;
    leida: boolean;
    registro_id?: number | null;
    modulo?: string;
}
export interface HistorialMaquina {
    id: number;
    maquina_id: number;
    tipo_evento: string;
    descripcion: string;
    usuario_responsable: string;
    fecha: string;
    observaciones?: string;
    titulo?: string;
    metadata?: Record<string, unknown>;
}
export interface BitacoraRegistro {
    id: number;
    usuario_id: number;
    usuario_nombre: string;
    accion: string;
    modulo: string;
    registro_id?: number | null;
    fecha: string;
    direccion_ip: string;
    descripcion: string;
}
export type Bitacora = BitacoraRegistro;
export interface HistorialCompletoMaquina {
    maquina: Maquina | null;
    asignaciones: Asignacion[];
    mantenimientos: Mantenimiento[];
    contratos: ContratoMantenimiento[];
    bitacora: BitacoraRegistro[];
    eventos: HistorialMaquina[];
}
export interface DashboardStats {
    totalTecnicos: number;
    totalMaquinas: number;
    maquinasDisponibles: number;
    maquinasAsignadas: number;
    maquinasEnMantenimiento: number;
    maquinasFueraDeServicio: number;
    mantenimientosPendientes: number;
    contratosVigentes: number;
    contratosProximosVencer: number;
    contratosVencidos: number;
    alertasPendientes: number;
    anioMantenimientos: number;
    maquinasPorEstado: {
        estado: string;
        cantidad: number;
    }[];
    mantenimientosPorTipo: {
        tipo: string;
        cantidad: number;
    }[];
    maquinasPorTecnico: {
        tecnico: string;
        cantidad: number;
    }[];
    mantenimientosPorMes: {
        mes: string;
        cantidad: number;
    }[];
    contratosPorEstado: {
        estado: string;
        cantidad: number;
    }[];
}
