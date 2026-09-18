import { AsyncLocalStorage } from 'node:async_hooks';
import { verifyPassword } from '../modulos/autenticacion/passwords.js';
import { mantenimientosFinalizadosPorMes } from '../modulos/dashboard/estadisticas.js';
import {
  Usuario,
  Tecnico,
  Maquina,
  Asignacion,
  Mantenimiento,
  ContratoMantenimiento,
  Alerta,
  HistorialMaquina,
  BitacoraRegistro,
  DashboardStats
} from '../../shared/types.js';

export interface DatabaseData {
  usuarios: Usuario[];
  tecnicos: Tecnico[];
  maquinas: Maquina[];
  asignaciones: Asignacion[];
  mantenimientos: Mantenimiento[];
  contratos: ContratoMantenimiento[];
  alertas: Alerta[];
  historial: HistorialMaquina[];
  bitacora: BitacoraRegistro[];
}

export class IndustrialDatabase {
  constructor(public data: DatabaseData) {}

  public autenticar(username: string, password: unknown): Usuario | undefined {
    const user = this.data.usuarios.find(u => (u.username.toLowerCase() === username || u.correo.toLowerCase() === username) && u.estado === "Activo");
    if (!user || !verifyPassword(password, user.password || "")) return undefined;
    return this.getUsuarioById(user.id);
  }

  // BITÁCORA Y TRAZABILIDAD
  public registrarBitacora(
    usuario_id: number,
    usuario_nombre: string,
    accion: string,
    modulo: string,
    registro_id: number | null,
    ip: string,
    descripcion: string
  ) {
    const newId = this.data.bitacora.length > 0 ? Math.max(...this.data.bitacora.map(b => b.id)) + 1 : 1;
    const registro: BitacoraRegistro = {
      id: newId,
      usuario_id,
      usuario_nombre,
      accion,
      modulo,
      registro_id,
      fecha: new Date().toISOString(),
      fecha_hora: new Date().toISOString(),
      direccion_ip: ip || '127.0.0.1',
      ip_address: ip || '127.0.0.1',
      descripcion,
      detalles: descripcion
    };
    this.data.bitacora.unshift(registro);

  }

  public registrarHistorialMaquina(
    maquina_id: number,
    tipo_evento: 'Asignación' | 'Devolución' | 'Mantenimiento' | 'Cambio de Estado' | 'Reparación' | 'Movimiento',
    descripcion: string,
    usuario_responsable: string,
    observaciones?: string
  ) {
    const newId = this.data.historial.length > 0 ? Math.max(...this.data.historial.map(h => h.id)) + 1 : 1;
    const reg: HistorialMaquina = {
      id: newId,
      maquina_id,
      tipo_evento,
      descripcion,
      usuario_responsable,
      fecha: new Date().toISOString(),
      observaciones: observaciones || ''
    };
    this.data.historial.unshift(reg);

  }

  // USUARIOS
  public getUsuarios(): Usuario[] {
    return this.data.usuarios.map(({ password, ...u }) => u as Usuario);
  }

  public getUsuarioById(id: number): Usuario | undefined {
    const u = this.data.usuarios.find(user => user.id === id);
    if (!u) return undefined;
    const { password, ...rest } = u;
    return rest as Usuario;
  }

  public crearUsuario(u: Partial<Usuario> & { password?: string }, usuario_ip: string, req_user: string): Usuario {
    const newId = this.data.usuarios.length > 0 ? Math.max(...this.data.usuarios.map(x => x.id)) + 1 : 1;
    const baseUsername = u.username || (u.correo ? u.correo.split('@')[0] : `user_${newId}`);
    
    // Evitar username repetido
    let finalUsername = baseUsername;
    let counter = 1;
    while (this.data.usuarios.some(existing => existing.username.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${baseUsername}${counter}`;
      counter++;
    }

    const nuevo: any = {
      id: newId,
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      correo: u.correo || `${finalUsername}@prodima.gt`,
      username: finalUsername,
      rol: u.rol || 'Técnico',
      estado: u.estado || 'Activo',
      fecha_creacion: new Date().toISOString(),
      password: u.password || 'password123'
    };
    this.data.usuarios.push(nuevo);

    // Si el nuevo usuario es 'Técnico', sincronizar automáticamente perfil en catálogo de técnicos si no existe
    if (nuevo.rol === 'Técnico') {
      const existeTecnico = this.data.tecnicos.find(t => 
        t.usuario_id === newId || 
        (t.correo && t.correo.toLowerCase() === nuevo.correo.toLowerCase())
      );
      if (!existeTecnico) {
        const newTecId = this.data.tecnicos.length > 0 ? Math.max(...this.data.tecnicos.map(x => x.id)) + 1 : 1;
        this.data.tecnicos.push({
          id: newTecId,
          nombre: nuevo.nombre,
          apellido: nuevo.apellido,
          DPI: 'Pendiente',
          telefono: 'Pendiente',
          correo: nuevo.correo,
          especialidad: 'Soldadura TIG (GTAW)',
          puesto: 'Técnico Especialista en Soldadura',
          fecha_ingreso: new Date().toISOString().split('T')[0],
          estado: 'Activo',
          usuario_id: newId,
          homologado: true
        });
      }
    }

    this.registrarBitacora(1, req_user, 'CREAR_USUARIO', 'Usuarios', newId, usuario_ip, `Usuario '${nuevo.username}' creado con rol ${nuevo.rol}.`);
    
    const { password, ...rest } = nuevo;
    return rest as Usuario;
  }

  public actualizarUsuario(id: number, u: Partial<Usuario> & { password?: string }, usuario_ip: string, req_user: string): Usuario {
    const idx = this.data.usuarios.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');

    this.data.usuarios[idx] = { ...this.data.usuarios[idx], ...u };
    
    // Sincronizar con técnico vinculado si existe
    const tecIdx = this.data.tecnicos.findIndex(t => t.usuario_id === id);
    if (tecIdx !== -1) {
      if (u.nombre) this.data.tecnicos[tecIdx].nombre = u.nombre;
      if (u.apellido) this.data.tecnicos[tecIdx].apellido = u.apellido;
      if (u.correo) this.data.tecnicos[tecIdx].correo = u.correo;
      if (u.estado) this.data.tecnicos[tecIdx].estado = u.estado;
    }


    this.registrarBitacora(1, req_user, 'ACTUALIZAR_USUARIO', 'Usuarios', id, usuario_ip, `Usuario ID ${id} actualizado.`);
    const { password, ...rest } = this.data.usuarios[idx];
    return rest as Usuario;
  }

  public toggleEstadoUsuario(id: number, usuario_ip: string, req_user: string): Usuario {
    const idx = this.data.usuarios.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');

    const actual = this.data.usuarios[idx];
    const nuevoEstado = actual.estado === 'Activo' ? 'Inactivo' : 'Activo';
    this.data.usuarios[idx].estado = nuevoEstado;

    // Sincronizar técnico vinculado
    const tecIdx = this.data.tecnicos.findIndex(t => t.usuario_id === id);
    if (tecIdx !== -1) {
      this.data.tecnicos[tecIdx].estado = nuevoEstado;
    }


    this.registrarBitacora(1, req_user, 'CAMBIAR_ESTADO_USUARIO', 'Usuarios', id, usuario_ip, `Cambió estado de usuario '${actual.username}' a ${nuevoEstado}.`);
    const { password, ...rest } = this.data.usuarios[idx];
    return rest as Usuario;
  }

  // TÉCNICOS
  public getTecnicos(): Tecnico[] {
    return this.data.tecnicos.map(t => {
      const maquinasAsignadas = this.data.asignaciones.filter(a => a.tecnico_id === t.id && a.estado === 'Activa').length;
      const mantenimientos = this.data.mantenimientos.filter(m => 
        (m.tecnico_id && m.tecnico_id === t.id) ||
        (m.tecnico_responsable && m.tecnico_responsable.toLowerCase().includes(t.nombre.toLowerCase()))
      ).length;

      // Buscar usuario vinculado
      let usuarioUsername = undefined;
      if (t.usuario_id) {
        const u = this.data.usuarios.find(user => user.id === t.usuario_id);
        if (u) usuarioUsername = u.username;
      }

      return {
        ...t,
        usuario_username: usuarioUsername,
        maquinas_asignadas_count: maquinasAsignadas,
        mantenimientos_count: mantenimientos
      };
    });
  }

  public getTecnicoById(id: number): Tecnico | undefined {
    return this.getTecnicos().find(t => t.id === id);
  }

  public crearTecnico(
    t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string },
    usuario_ip: string,
    req_user: string
  ): Tecnico {
    const newId = this.data.tecnicos.length > 0 ? Math.max(...this.data.tecnicos.map(x => x.id)) + 1 : 1;
    
    let linkedUserId = t.usuario_id || null;

    // Si crear_usuario es true o si no tiene usuario_id asignado, generar cuenta de acceso automáticamente
    if (t.crear_usuario !== false) {
      const uId = this.data.usuarios.length > 0 ? Math.max(...this.data.usuarios.map(x => x.id)) + 1 : 1;
      const baseUsername = t.username?.trim() || (t.correo ? t.correo.split('@')[0] : `${(t.nombre || 'tec').toLowerCase().replace(/\s+/g, '')}${(t.apellido || '').toLowerCase().replace(/\s+/g, '')}`);
      
      let finalUsername = baseUsername || `tec_${newId}`;
      let counter = 1;
      while (this.data.usuarios.some(u => u.username.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      const pass = t.password?.trim() || 'Tec2026!';
      const nuevoUsuario: any = {
        id: uId,
        nombre: t.nombre || 'Técnico',
        apellido: t.apellido || '',
        correo: t.correo || `${finalUsername}@prodima.gt`,
        username: finalUsername,
        rol: 'Técnico',
        estado: t.estado || 'Activo',
        fecha_creacion: new Date().toISOString(),
        password: pass
      };

      this.data.usuarios.push(nuevoUsuario);
      linkedUserId = uId;

      this.registrarBitacora(1, req_user, 'CREAR_USUARIO_AUTO', 'Usuarios', uId, usuario_ip, `Usuario de acceso '${finalUsername}' generado para técnico con rol 'Técnico'.`);
    }

    const nuevo: Tecnico = {
      id: newId,
      nombre: t.nombre || '',
      apellido: t.apellido || '',
      DPI: t.DPI || '',
      telefono: t.telefono || '',
      correo: t.correo || '',
      especialidad: t.especialidad || 'Soldadura TIG (GTAW)',
      puesto: t.puesto || 'Técnico Especialista en Soldadura',
      fecha_ingreso: t.fecha_ingreso || new Date().toISOString().split('T')[0],
      estado: t.estado || 'Activo',
      usuario_id: linkedUserId,
      homologado: t.homologado !== undefined ? t.homologado : true
    };
    this.data.tecnicos.push(nuevo);


    this.registrarBitacora(1, req_user, 'CREAR_TECNICO', 'Técnicos', newId, usuario_ip, `Registrado técnico ${nuevo.nombre} ${nuevo.apellido} (DPI: ${nuevo.DPI}) con usuario de acceso asignado.`);
    return this.getTecnicoById(newId) || nuevo;
  }

  public actualizarTecnico(
    id: number,
    t: Partial<Tecnico> & { password?: string; username?: string; crear_usuario?: boolean },
    usuario_ip: string,
    req_user: string
  ): Tecnico {
    const idx = this.data.tecnicos.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Técnico no encontrado');

    const actual = this.data.tecnicos[idx];

    // Si tiene usuario vinculado, sincronizar datos y credenciales
    if (actual.usuario_id) {
      const uIdx = this.data.usuarios.findIndex(u => u.id === actual.usuario_id);
      if (uIdx !== -1) {
        if (t.nombre) this.data.usuarios[uIdx].nombre = t.nombre;
        if (t.apellido) this.data.usuarios[uIdx].apellido = t.apellido;
        if (t.correo) this.data.usuarios[uIdx].correo = t.correo;
        if (t.estado) this.data.usuarios[uIdx].estado = t.estado;
        if (t.username) this.data.usuarios[uIdx].username = t.username;
        if (t.password) (this.data.usuarios[uIdx] as any).password = t.password;
      }
    } else if (t.crear_usuario || t.username) {
      // Crear cuenta si no la tenía
      const uId = this.data.usuarios.length > 0 ? Math.max(...this.data.usuarios.map(x => x.id)) + 1 : 1;
      const baseUsername = t.username?.trim() || (t.correo ? t.correo.split('@')[0] : `${actual.nombre.toLowerCase().replace(/\s+/g, '')}`);
      let finalUsername = baseUsername;
      let counter = 1;
      while (this.data.usuarios.some(u => u.username.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }
      const nuevoUsuario: any = {
        id: uId,
        nombre: t.nombre || actual.nombre,
        apellido: t.apellido || actual.apellido,
        correo: t.correo || actual.correo,
        username: finalUsername,
        rol: 'Técnico',
        estado: t.estado || actual.estado || 'Activo',
        fecha_creacion: new Date().toISOString(),
        password: t.password || 'Tec2026!'
      };
      this.data.usuarios.push(nuevoUsuario);
      t.usuario_id = uId;
    }

    this.data.tecnicos[idx] = { ...this.data.tecnicos[idx], ...t };


    this.registrarBitacora(1, req_user, 'ACTUALIZAR_TECNICO', 'Técnicos', id, usuario_ip, `Actualizada información del técnico ID ${id}.`);
    return this.getTecnicoById(id) || this.data.tecnicos[idx];
  }

  public eliminarTecnico(id: number, usuario_ip: string, req_user: string): { mensaje: string; id: number } {
    const idx = this.data.tecnicos.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Técnico no encontrado');

    const tec = this.data.tecnicos[idx];

    // Eliminar también la cuenta de usuario vinculada
    if (tec.usuario_id) {
      const uIdx = this.data.usuarios.findIndex(u => u.id === tec.usuario_id);
      if (uIdx !== -1) {
        this.data.usuarios.splice(uIdx, 1);
      }
    }

    // Finalizar o liberar asignaciones activas de este técnico
    this.data.asignaciones.forEach(a => {
      if (a.tecnico_id === id && a.estado === 'Activa') {
        a.estado = 'Finalizada';
        a.fecha_devolucion = new Date().toISOString();
        a.observaciones = (a.observaciones || '') + ' [Finalizada por eliminación de técnico]';
        const maq = this.data.maquinas.find(m => m.id === a.maquina_id);
        if (maq && maq.estado === 'Asignada') {
          maq.estado = 'Disponible';
        }
      }
    });

    // En órdenes de mantenimiento, desvincular
    this.data.mantenimientos.forEach(m => {
      if (m.tecnico_id === id) {
        m.tecnico_id = undefined;
        m.tecnico_responsable = `${tec.nombre} ${tec.apellido} (Eliminado)`;
      }
    });

    this.data.asignaciones.forEach(a => { if (a.tecnico_id === id) a.tecnico_id = null; });
    this.data.mantenimientos.forEach(m => { if (m.usuario_id === tec.usuario_id) m.usuario_id = undefined; });
    this.data.tecnicos.splice(idx, 1);


    this.registrarBitacora(1, req_user, 'ELIMINAR_TECNICO', 'Técnicos', id, usuario_ip, `Eliminado permanentemente el técnico ${tec.nombre} ${tec.apellido} (ID ${id}).`);
    return { mensaje: `Técnico ${tec.nombre} ${tec.apellido} eliminado correctamente.`, id };
  }

  // MÁQUINAS DE SOLDAR
  public getMaquinas(): Maquina[] {
    return this.data.maquinas.map(m => {
      const asignacionActiva = this.data.asignaciones.find(a => a.maquina_id === m.id && a.estado === 'Activa');
      let tecnicoActual = '';
      if (asignacionActiva) {
        const tec = this.data.tecnicos.find(t => t.id === asignacionActiva.tecnico_id);
        if (tec) tecnicoActual = `${tec.nombre} ${tec.apellido}`;
      }
      return {
        ...m,
        tecnico_actual: tecnicoActual
      };
    });
  }

  public getMaquinaById(id: number): Maquina | undefined {
    return this.getMaquinas().find(m => m.id === id);
  }

  public crearMaquina(m: Partial<Maquina>, usuario_ip: string, req_user: string): Maquina {
    const newId = this.data.maquinas.length > 0 ? Math.max(...this.data.maquinas.map(x => x.id)) + 1 : 1;
    const marcaClean = (m.marca || 'PRD').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'PRD';
    const fecha = m.fecha_adquisicion || new Date().toISOString().split('T')[0];
    const fechaParts = fecha.split('-');
    const dateCode = fechaParts.length >= 2 ? `${fechaParts[0]}${fechaParts[1]}` : '202601';
    const generatedCode = `PRD-${marcaClean}-${dateCode}-${String(newId).padStart(3, '0')}`;

    const nueva: Maquina = {
      id: newId,
      codigo_interno: m.codigo_interno || generatedCode,
      marca: m.marca || '',
      modelo: m.modelo || '',
      numero_serie: m.numero_serie || '',
      tipo: m.tipo || 'Inversora',
      voltaje: m.voltaje || '220V',
      amperaje: m.amperaje || '250A',
      potencia: m.potencia || '10 kW',
      ubicacion: m.ubicacion || 'Bodega Principal',
      fecha_adquisicion: fecha,
      proveedor: m.proveedor || 'Proveedor Industrial',
      estado: m.estado || 'Disponible',
      observaciones: m.observaciones || ''
    };

    this.data.maquinas.push(nueva);


    this.registrarBitacora(1, req_user, 'CREAR_MAQUINA', 'Máquinas', newId, usuario_ip, `Registrada nueva máquina de soldar ${nueva.codigo_interno} (${nueva.marca} ${nueva.modelo}).`);
    this.registrarHistorialMaquina(newId, 'Cambio de Estado', `Registro inicial de máquina en catálogo. Estado: ${nueva.estado}`, req_user);
    
    return nueva;
  }

  public actualizarMaquina(id: number, m: Partial<Maquina>, usuario_ip: string, req_user: string): Maquina {
    const idx = this.data.maquinas.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Máquina no encontrada');

    const previo = this.data.maquinas[idx];
    const estadoAnterior = previo.estado;

    this.data.maquinas[idx] = { ...previo, ...m };
    const actualizada = this.data.maquinas[idx];


    if (m.estado && m.estado !== estadoAnterior) {
      this.registrarHistorialMaquina(id, 'Cambio de Estado', `Estado modificado de '${estadoAnterior}' a '${m.estado}'`, req_user);
    }

    this.registrarBitacora(1, req_user, 'ACTUALIZAR_MAQUINA', 'Máquinas', id, usuario_ip, `Actualizada máquina de soldar ${actualizada.codigo_interno}.`);
    return actualizada;
  }

  public eliminarMaquina(id: number, usuario_ip: string, req_user: string): { mensaje: string; id: number } {
    const idx = this.data.maquinas.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Máquina no encontrada');

    const maq = this.data.maquinas[idx];

    // Limpiar asignaciones asociadas
    this.data.asignaciones = this.data.asignaciones.filter(a => a.maquina_id !== id);
    // Limpiar mantenimientos asociados
    this.data.mantenimientos = this.data.mantenimientos.filter(m => m.maquina_id !== id);
    // Limpiar contratos asociados
    this.data.contratos = this.data.contratos.filter(c => c.maquina_id !== id);
    // Limpiar historial asociado
    this.data.historial = this.data.historial.filter(h => h.maquina_id !== id);

    this.data.maquinas.splice(idx, 1);


    this.registrarBitacora(1, req_user, 'ELIMINAR_MAQUINA', 'Máquinas', id, usuario_ip, `Eliminada máquina de soldar ${maq.codigo_interno} (${maq.marca} ${maq.modelo}).`);
    return { mensaje: `Máquina ${maq.codigo_interno} eliminada correctamente.`, id };
  }

  public borrarTodo(): { mensaje: string } {
    this.data.tecnicos = [];
    this.data.maquinas = [];
    this.data.asignaciones = [];
    this.data.mantenimientos = [];
    this.data.contratos = [];
    this.data.alertas = [];
    this.data.historial = [];
    this.data.bitacora = [];

    // Mantener sólo el usuario Administrador
    this.data.usuarios = this.data.usuarios.filter(u => u.rol === 'Administrador');
    if (this.data.usuarios.length === 0) throw new Error("No hay administrador para conservar.");

    return { mensaje: 'Catálogo limpiado exitosamente. La base de datos está lista para ingresar nuevos técnicos y máquinas.' };
  }

  // ASIGNACIONES (REGLAS ESTRICTAS DE NEGOCIO)
  public getAsignaciones(): Asignacion[] {
    return this.data.asignaciones.map(a => {
      const tec = this.data.tecnicos.find(t => t.id === a.tecnico_id);
      const maq = this.data.maquinas.find(m => m.id === a.maquina_id);
      return {
        ...a,
        tecnico_nombre: tec ? `${tec.nombre} ${tec.apellido}` : 'Desconocido',
        maquina_codigo: maq ? maq.codigo_interno : 'N/A',
        maquina_marca_modelo: maq ? `${maq.marca} ${maq.modelo}` : 'N/A'
      };
    });
  }

  public crearAsignacion(
    tecnico_id: number,
    maquina_id: number,
    motivo: string,
    usuario_responsable: string,
    observaciones: string,
    ip: string
  ): Asignacion {
    const maquina = this.data.maquinas.find(m => m.id === maquina_id);
    if (!maquina) throw new Error('La máquina seleccionada no existe.');

    const tecnico = this.data.tecnicos.find(t => t.id === tecnico_id);
    if (!tecnico) throw new Error('El técnico seleccionado no existe.');

    // Validación de homologación y estado activo
    if (tecnico.estado !== 'Activo') {
      throw new Error(`El técnico ${tecnico.nombre} ${tecnico.apellido} está inactivo.`);
    }
    if (tecnico.homologado === false) {
      throw new Error(`El técnico ${tecnico.nombre} ${tecnico.apellido} no cuenta con homologación vigente.`);
    }

    // Regla 1: No permitir asignación si ya tiene asignación activa
    const asignacionExistente = this.data.asignaciones.find(a => a.maquina_id === maquina_id && a.estado === 'Activa');
    if (asignacionExistente) {
      throw new Error(`REGLA DE NEGOCIO VIOLADA: La máquina ${maquina.codigo_interno} ya posee una asignación activa a un técnico. Debe ser devuelta antes de reasignar.`);
    }

    // Regla 2: No permitir asignar si está fuera de servicio, reparación o baja
    if (['Fuera de servicio', 'Reparación', 'Baja'].includes(maquina.estado)) {
      throw new Error(`REGLA DE NEGOCIO VIOLADA: La máquina ${maquina.codigo_interno} no puede ser asignada porque su estado actual es '${maquina.estado}'.`);
    }

    const newId = this.data.asignaciones.length > 0 ? Math.max(...this.data.asignaciones.map(x => x.id)) + 1 : 1;
    const nuevaAsignacion: Asignacion = {
      id: newId,
      tecnico_id,
      maquina_id,
      fecha_asignacion: new Date().toISOString(),
      fecha_devolucion: null,
      motivo,
      estado: 'Activa',
      usuario_responsable,
      observaciones
    };

    // Actualizar estado de la máquina a ASIGNADA
    const maqIdx = this.data.maquinas.findIndex(m => m.id === maquina_id);
    if (maqIdx !== -1) {
      this.data.maquinas[maqIdx].estado = 'Asignada';
    }

    this.data.asignaciones.push(nuevaAsignacion);

    // Sincronizar orden de mantenimiento activa de la máquina con el técnico homologado asignado
    const mant = this.data.mantenimientos.find(m => m.maquina_id === maquina_id && ['Programado', 'En proceso'].includes(m.estado));
    if (mant) {
      mant.tecnico_id = tecnico_id;
      mant.tecnico_responsable = `${tecnico.nombre} ${tecnico.apellido}`;
    }


    // Registrar en Historial y Bitácora
    this.registrarHistorialMaquina(
      maquina_id,
      'Asignación',
      `Máquina asignada al técnico ${tecnico.nombre} ${tecnico.apellido}. Motivo: ${motivo}`,
      usuario_responsable,
      observaciones
    );

    this.registrarBitacora(
      1,
      usuario_responsable,
      'CREAR_ASIGNACION',
      'Asignaciones',
      newId,
      ip,
      `Asignación de máquina ${maquina.codigo_interno} al técnico ${tecnico.nombre} ${tecnico.apellido}.`
    );

    return this.getAsignaciones().find(a => a.id === newId)!;
  }

  public finalizarAsignacion(id: number, usuario_responsable: string, observaciones: string, ip: string): Asignacion {
    const idx = this.data.asignaciones.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Asignación no encontrada');

    const asig = this.data.asignaciones[idx];
    if (asig.estado !== 'Activa') {
      throw new Error('Solo se pueden finalizar asignaciones activas.');
    }

    asig.estado = 'Finalizada';
    asig.fecha_devolucion = new Date().toISOString();
    if (observaciones) asig.observaciones = `${asig.observaciones || ''} | Devolución: ${observaciones}`;

    // Actualizar máquina a DISPONIBLE
    const maqIdx = this.data.maquinas.findIndex(m => m.id === asig.maquina_id);
    if (maqIdx !== -1) {
      this.data.maquinas[maqIdx].estado = 'Disponible';
    }

    // Si la máquina tenía un mantenimiento en proceso, finalizarlo coherentemente con la devolución
    const mantEnProceso = this.data.mantenimientos.find(m => m.maquina_id === asig.maquina_id && m.estado === 'En proceso');
    if (mantEnProceso) {
      mantEnProceso.estado = 'Finalizado';
      mantEnProceso.fecha_fin = new Date().toISOString().split('T')[0];
      mantEnProceso.observaciones = (mantEnProceso.observaciones || '') + ' | Mantenimiento completado y finalizado al recibir la devolución del equipo.';
    }


    const tec = this.data.tecnicos.find(t => t.id === asig.tecnico_id);
    const tecNombre = tec ? `${tec.nombre} ${tec.apellido}` : 'Técnico';

    this.registrarHistorialMaquina(
      asig.maquina_id,
      'Devolución',
      `Devolución registrada por el técnico ${tecNombre}. Estado asignación: Finalizada`,
      usuario_responsable,
      observaciones
    );

    this.registrarBitacora(
      1,
      usuario_responsable,
      'FINALIZAR_ASIGNACION',
      'Asignaciones',
      id,
      ip,
      `Devolución de asignación ID ${id}. Máquina pasó a estado Disponible.`
    );

    return this.getAsignaciones().find(a => a.id === id)!;
  }

  // MANTENIMIENTOS
  public getMantenimientos(): Mantenimiento[] {
    return this.data.mantenimientos.map(m => {
      const maq = this.data.maquinas.find(x => x.id === m.maquina_id);
      return {
        ...m,
        maquina_codigo: maq ? `${maq.codigo_interno} (${maq.marca} ${maq.modelo})` : 'N/A'
      };
    });
  }

  public crearMantenimiento(m: Partial<Mantenimiento>, usuario_ip: string, req_user: string): Mantenimiento {
    const newId = this.data.mantenimientos.length > 0 ? Math.max(...this.data.mantenimientos.map(x => x.id)) + 1 : 1;
    
    // 1. VALIDACIÓN AUTOMÁTICA DE CONTRATO DE MANTENIMIENTO ACTIVO
    const contratoActivo = this.data.contratos.find(
      c => c.maquina_id === m.maquina_id && ['Vigente', 'Próximo a vencer'].includes(c.estado)
    );

    let detalleValidacionContrato = '';
    let proveedorFinal = m.proveedor || 'Servicio Técnico';
    let observacionesFinal = m.observaciones || '';

    if (contratoActivo) {
      detalleValidacionContrato = `Contrato Activo: ${contratoActivo.numero_contrato} (${contratoActivo.proveedor}) vigencia hasta ${contratoActivo.fecha_fin}`;
      proveedorFinal = contratoActivo.proveedor;
      if (!observacionesFinal.includes(contratoActivo.numero_contrato)) {
        observacionesFinal = `[Póliza Activa: ${contratoActivo.numero_contrato}] ${observacionesFinal}`.trim();
      }
    } else {
      detalleValidacionContrato = 'Sin contrato de mantenimiento activo vigente (Gasto directo de taller)';
      if (!observacionesFinal.includes('Sin contrato activo')) {
        observacionesFinal = `[Sin contrato activo] ${observacionesFinal}`.trim();
      }
    }

    const nuevo: Mantenimiento = {
      id: newId,
      maquina_id: m.maquina_id!,
      tipo: m.tipo || 'Preventivo',
      descripcion: m.descripcion || '',
      fecha_inicio: m.fecha_inicio || new Date().toISOString().split('T')[0],
      fecha_fin: m.fecha_fin || new Date().toISOString().split('T')[0],
      costo: Number(m.costo) || 0,
      proveedor: proveedorFinal,
      tecnico_responsable: m.tecnico_responsable || req_user,
      tecnico_id: m.tecnico_id,
      estado: m.estado || 'Programado',
      observaciones: observacionesFinal
    };

    this.data.mantenimientos.push(nuevo);

    // Si el mantenimiento está en proceso o programado de inmediato, cambiar estado de máquina a EN MANTENIMIENTO
    if (['En proceso', 'Programado'].includes(nuevo.estado)) {
      const maqIdx = this.data.maquinas.findIndex(x => x.id === nuevo.maquina_id);
      if (maqIdx !== -1) {
        this.data.maquinas[maqIdx].estado = 'En mantenimiento';
      }
    }

    // 2. COHERENCIA DE ASIGNACIÓN DIRECTA AL TÉCNICO
    // Si tiene un mantenimiento, debe tener una máquina asignada directamente al técnico
    let tecId = m.tecnico_id;
    if (!tecId && nuevo.tecnico_responsable) {
      const tec = this.data.tecnicos.find(t => 
        (t.id === nuevo.tecnico_id) ||
        `${t.nombre} ${t.apellido}`.toLowerCase() === nuevo.tecnico_responsable.toLowerCase() ||
        nuevo.tecnico_responsable.toLowerCase().includes(t.correo.toLowerCase()) ||
        nuevo.tecnico_responsable.toLowerCase().includes(t.nombre.toLowerCase())
      );
      if (tec) tecId = tec.id;
    }

    // Si no se especificó un técnico válido, asignar automáticamente el primer técnico propio homologado activo
    if (!tecId) {
      const tecHomologado = this.data.tecnicos.find(t => t.estado === 'Activo' && t.homologado !== false);
      if (tecHomologado) {
        tecId = tecHomologado.id;
        nuevo.tecnico_id = tecId;
        nuevo.tecnico_responsable = `${tecHomologado.nombre} ${tecHomologado.apellido}`;
      }
    } else {
      const tecObj = this.data.tecnicos.find(t => t.id === tecId);
      if (tecObj) {
        if (tecObj.estado !== 'Activo') {
          throw new Error(`El técnico ${tecObj.nombre} ${tecObj.apellido} no se encuentra activo.`);
        }
        if (tecObj.homologado === false) {
          throw new Error(`El técnico ${tecObj.nombre} ${tecObj.apellido} no está homologado. Solo se permite asignar técnicos propios homologados.`);
        }
      }
    }

    if (tecId) {
      const asignacionActiva = this.data.asignaciones.find(
        a => a.maquina_id === nuevo.maquina_id && a.estado === 'Activa'
      );

      if (!asignacionActiva || asignacionActiva.tecnico_id !== tecId) {
        if (asignacionActiva) {
          asignacionActiva.estado = 'Finalizada';
          asignacionActiva.fecha_devolucion = new Date().toISOString();
          asignacionActiva.observaciones = (asignacionActiva.observaciones || '') + ` [Reasignada a orden de mantenimiento #${newId}]`;
        }

        const asigId = this.data.asignaciones.length > 0 ? Math.max(...this.data.asignaciones.map(x => x.id)) + 1 : 1;
        const nuevaAsig: Asignacion = {
          id: asigId,
          tecnico_id: tecId,
          maquina_id: nuevo.maquina_id,
          fecha_asignacion: new Date().toISOString(),
          fecha_devolucion: null,
          motivo: `Asignación directa para ejecución de mantenimiento ${nuevo.tipo}: ${nuevo.descripcion}`,
          estado: 'Activa',
          usuario_responsable: req_user,
          observaciones: `Vinculada directamente a orden de mantenimiento #${newId} (${contratoActivo ? `Bajo contrato ${contratoActivo.numero_contrato}` : 'Sin contrato activo'})`
        };
        this.data.asignaciones.push(nuevaAsig);

        const tecObj = this.data.tecnicos.find(t => t.id === tecId);
        const tecNombre = tecObj ? `${tecObj.nombre} ${tecObj.apellido}` : `ID ${tecId}`;
        this.registrarHistorialMaquina(
          nuevo.maquina_id,
          'Asignación',
          `Máquina asignada directamente al técnico homologado ${tecNombre} por orden de mantenimiento #${newId}`,
          req_user
        );
      }
    }


    // 3. ACTUALIZAR HISTORIAL DE LA MÁQUINA EN CONSECUENCIA
    this.registrarHistorialMaquina(
      nuevo.maquina_id,
      'Mantenimiento',
      `Registrado mantenimiento ${nuevo.tipo}: ${nuevo.descripcion}. Validación: ${detalleValidacionContrato}. Estado: ${nuevo.estado}`,
      req_user,
      `Costo: Q${nuevo.costo.toFixed(2)} | Proveedor: ${nuevo.proveedor} | Técnico Asignado: ${nuevo.tecnico_responsable}`
    );

    this.registrarBitacora(
      1,
      req_user,
      'CREAR_MANTENIMIENTO',
      'Mantenimientos',
      newId,
      usuario_ip,
      `Nuevo mantenimiento ${nuevo.tipo} registrado. Validación de póliza: ${detalleValidacionContrato}.`
    );

    return this.getMantenimientos().find(x => x.id === newId)!;
  }

  public actualizarMantenimiento(id: number, m: Partial<Mantenimiento>, usuario_ip: string, req_user: string): Mantenimiento {
    const idx = this.data.mantenimientos.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Mantenimiento no encontrado');

    const previo = this.data.mantenimientos[idx];
    this.data.mantenimientos[idx] = { ...previo, ...m };
    const actualizado = this.data.mantenimientos[idx];

    // Si se finaliza el mantenimiento, liberar la máquina a Disponible
    if (actualizado.estado === 'Finalizado' && previo.estado !== 'Finalizado') {
      const maqIdx = this.data.maquinas.findIndex(x => x.id === actualizado.maquina_id);
      if (maqIdx !== -1) {
        // Verificar si tiene asignación activa
        const asig = this.data.asignaciones.find(a => a.maquina_id === actualizado.maquina_id && a.estado === 'Activa');
        this.data.maquinas[maqIdx].estado = asig ? 'Asignada' : 'Disponible';
      }
    }


    this.registrarHistorialMaquina(
      actualizado.maquina_id,
      'Mantenimiento',
      `Mantenimiento ID ${id} actualizado a estado '${actualizado.estado}'.`,
      req_user
    );

    this.registrarBitacora(1, req_user, 'ACTUALIZAR_MANTENIMIENTO', 'Mantenimientos', id, usuario_ip, `Mantenimiento ID ${id} modificado.`);
    return this.getMantenimientos().find(x => x.id === id)!;
  }

  public eliminarMantenimiento(id: number, usuario_ip: string, req_user: string): boolean {
    const idx = this.data.mantenimientos.findIndex(x => x.id === id);
    if (idx === -1) return false;

    const mant = this.data.mantenimientos[idx];

    // REGLA DE COHERENCIA: Si tiene una máquina, debe tener un mantenimiento
    const conteoMantenimientosMaquina = this.data.mantenimientos.filter(x => x.maquina_id === mant.maquina_id).length;
    if (conteoMantenimientosMaquina <= 1) {
      throw new Error('REGLA DE COHERENCIA: Toda máquina debe contar permanentemente con al menos un registro de mantenimiento. No es posible eliminar su único mantenimiento.');
    }

    this.data.mantenimientos.splice(idx, 1);

    // Si la máquina estaba en mantenimiento y ya no tiene otros mantenimientos activos, restaurar estado
    const otrosMants = this.data.mantenimientos.filter(
      x => x.maquina_id === mant.maquina_id && ['Programado', 'En proceso'].includes(x.estado)
    );
    if (otrosMants.length === 0) {
      const maqIdx = this.data.maquinas.findIndex(x => x.id === mant.maquina_id);
      if (maqIdx !== -1 && this.data.maquinas[maqIdx].estado === 'En mantenimiento') {
        const asig = this.data.asignaciones.find(a => a.maquina_id === mant.maquina_id && a.estado === 'Activa');
        this.data.maquinas[maqIdx].estado = asig ? 'Asignada' : 'Disponible';
      }
    }

    this.registrarBitacora(1, req_user, 'ELIMINAR_MANTENIMIENTO', 'Mantenimientos', id, usuario_ip, `Mantenimiento ID ${id} cancelado/eliminado.`);
    return true;
  }

  // CONTRATOS DE MANTENIMIENTO CON CÁLCULO DE DÍAS
  public getContratos(): ContratoMantenimiento[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.data.contratos.map(c => {
      const fechaFin = new Date(c.fecha_fin);
      fechaFin.setHours(0, 0, 0, 0);

      const diffTime = fechaFin.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let mensaje = '';
      let estadoCalc: 'Vigente' | 'Próximo a vencer' | 'Vencido' | 'Cancelado' = c.estado;

      if (c.estado !== 'Cancelado') {
        if (diffDays <= 0) {
          estadoCalc = 'Vencido';
          mensaje = 'Contrato VENCIDO';
        } else if (diffDays <= 7) {
          estadoCalc = 'Próximo a vencer';
          mensaje = `URGENTE: Contrato vence en ${diffDays} día(s)`;
        } else if (diffDays <= 30) {
          estadoCalc = 'Próximo a vencer';
          mensaje = `Contrato próximo a vencer en ${diffDays} días`;
        } else {
          estadoCalc = 'Vigente';
          mensaje = `Vigente por ${diffDays} días más`;
        }
      }

      const maq = this.data.maquinas.find(m => m.id === c.maquina_id);

      return {
        ...c,
        estado: estadoCalc,
        dias_restantes: diffDays,
        mensaje_vencimiento: mensaje,
        maquina_codigo: maq ? `${maq.codigo_interno} (${maq.marca} ${maq.modelo})` : 'N/A'
      };
    });
  }

  public crearContrato(c: Partial<ContratoMantenimiento>, usuario_ip: string, req_user: string): ContratoMantenimiento {
    const newId = this.data.contratos.length > 0 ? Math.max(...this.data.contratos.map(x => x.id)) + 1 : 1;
    const nuevo: ContratoMantenimiento = {
      id: newId,
      maquina_id: c.maquina_id!,
      proveedor: c.proveedor || '',
      numero_contrato: c.numero_contrato || `CTR-${newId}`,
      fecha_inicio: c.fecha_inicio || new Date().toISOString().split('T')[0],
      fecha_fin: c.fecha_fin || new Date().toISOString().split('T')[0],
      costo: Number(c.costo) || 0,
      tipo_servicio: c.tipo_servicio || 'Mantenimiento Preventivo / Correctivo',
      condiciones: c.condiciones || 'Garantía estándar de fábrica',
      estado: c.estado || 'Vigente',
      observaciones: c.observaciones || ''
    };

    this.data.contratos.push(nuevo);


    this.ejecutarRevisionAlertas();
    this.registrarBitacora(1, req_user, 'CREAR_CONTRATO', 'Contratos', newId, usuario_ip, `Nuevo contrato de mantenimiento ${nuevo.numero_contrato} registrado.`);
    return this.getContratos().find(x => x.id === newId)!;
  }

  public actualizarContrato(id: number, c: Partial<ContratoMantenimiento>, usuario_ip: string, req_user: string): ContratoMantenimiento {
    const idx = this.data.contratos.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Contrato no encontrado');

    this.data.contratos[idx] = { ...this.data.contratos[idx], ...c };


    this.ejecutarRevisionAlertas();
    this.registrarBitacora(1, req_user, 'ACTUALIZAR_CONTRATO', 'Contratos', id, usuario_ip, `Contrato ID ${id} actualizado.`);
    return this.getContratos().find(x => x.id === id)!;
  }

  // SISTEMA DE ALERTAS AUTOMÁTICAS
  public ejecutarRevisionAlertas(): number {
    const contratos = this.getContratos();
    let alertasGeneradas = 0;

    // 1. Revisar Contratos
    for (const ctr of contratos) {
      if (ctr.estado === 'Próximo a vencer' || ctr.estado === 'Vencido') {
        const existeAlerta = this.data.alertas.some(a => a.modulo === 'Contratos' && a.registro_id === ctr.id && !a.leida);
        if (!existeAlerta) {
          const prioridad = ctr.dias_restantes! <= 7 ? 'Crítica' : ctr.dias_restantes! <= 15 ? 'Alta' : 'Advertencia';
          const newId = this.data.alertas.length > 0 ? Math.max(...this.data.alertas.map(x => x.id)) + 1 : 1;
          this.data.alertas.unshift({
            id: newId,
            tipo: ctr.estado === 'Vencido' ? 'Contrato Vencido' : 'Contrato Próximo a Vencer',
            titulo: ctr.mensaje_vencimiento || 'Alerta de Contrato',
            mensaje: `El contrato ${ctr.numero_contrato} de la máquina ${ctr.maquina_codigo} finaliza el ${ctr.fecha_fin}.`,
            prioridad,
            fecha_generacion: new Date().toISOString(),
            leida: false,
            registro_id: ctr.id,
            modulo: 'Contratos'
          });
          alertasGeneradas++;
        }
      }
    }

    // 2. Revisar Mantenimientos Próximos o Vencidos
    const mantenimientos = this.getMantenimientos();
    const hoyStr = new Date().toISOString().split('T')[0];
    for (const m of mantenimientos) {
      if (m.estado === 'Programado' && m.fecha_inicio <= hoyStr) {
        const existe = this.data.alertas.some(a => a.modulo === 'Mantenimientos' && a.registro_id === m.id && !a.leida);
        if (!existe) {
          const newId = this.data.alertas.length > 0 ? Math.max(...this.data.alertas.map(x => x.id)) + 1 : 1;
          this.data.alertas.unshift({
            id: newId,
            tipo: 'Mantenimiento Próximo',
            titulo: 'Mantenimiento Programado Pendiente',
            mensaje: `El mantenimiento ${m.tipo} para la máquina ${m.maquina_codigo} estaba programado para el ${m.fecha_inicio}.`,
            prioridad: 'Alta',
            fecha_generacion: new Date().toISOString(),
            leida: false,
            registro_id: m.id,
            modulo: 'Mantenimientos'
          });
          alertasGeneradas++;
        }
      }
    }

    // 3. Revisar Máquinas Fuera de Servicio
    const maquinas = this.getMaquinas();
    for (const maq of maquinas) {
      if (['Fuera de servicio', 'Baja'].includes(maq.estado)) {
        const existe = this.data.alertas.some(a => a.modulo === 'Máquinas' && a.registro_id === maq.id && !a.leida);
        if (!existe) {
          const newId = this.data.alertas.length > 0 ? Math.max(...this.data.alertas.map(x => x.id)) + 1 : 1;
          this.data.alertas.unshift({
            id: newId,
            tipo: 'Máquina Fuera de Servicio',
            titulo: `Máquina ${maq.codigo_interno} ${maq.estado}`,
            mensaje: `La máquina de soldar ${maq.marca} ${maq.modelo} (${maq.codigo_interno}) está en estado '${maq.estado}'.`,
            prioridad: 'Crítica',
            fecha_generacion: new Date().toISOString(),
            leida: false,
            registro_id: maq.id,
            modulo: 'Máquinas'
          });
          alertasGeneradas++;
        }
      }
    }

    if (alertasGeneradas > 0) {

    }

    return alertasGeneradas;
  }

  public getAlertas(soloNoLeidas: boolean = false): Alerta[] {
    if (soloNoLeidas) {
      return this.data.alertas.filter(a => !a.leida);
    }
    return this.data.alertas;
  }

  public marcarAlertaLeida(id: number): Alerta {
    const idx = this.data.alertas.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Alerta no encontrada');

    this.data.alertas[idx].leida = true;

    return this.data.alertas[idx];
  }

  public marcarTodasAlertasLeidas(): { modificadas: number } {
    let count = 0;
    this.data.alertas.forEach(a => {
      if (!a.leida) {
        a.leida = true;
        count++;
      }
    });

    return { modificadas: count };
  }

  public eliminarAlerta(id: number): boolean {
    const idx = this.data.alertas.findIndex(a => a.id === id);
    if (idx === -1) return false;

    this.data.alertas.splice(idx, 1);

    return true;
  }

  public eliminarTodasAlertas(soloLeidas: boolean = false): { eliminadas: number } {
    const totalInicial = this.data.alertas.length;
    if (soloLeidas) {
      this.data.alertas = this.data.alertas.filter(a => !a.leida);
    } else {
      this.data.alertas = [];
    }

    return { eliminadas: totalInicial - this.data.alertas.length };
  }

  // HISTORIAL DE MÁQUINAS (TRAZABILIDAD UNIFICADA)
  public getHistorialPorMaquina(maquina_id: number) {
    const maquina = this.getMaquinas().find(m => m.id === maquina_id) || null;
    const asignaciones = this.getAsignaciones().filter(a => a.maquina_id === maquina_id);
    const mantenimientos = this.getMantenimientos().filter(m => m.maquina_id === maquina_id);
    const contratos = this.getContratos().filter(c => c.maquina_id === maquina_id);
    const bitacora = this.getBitacora().filter(b => b.modulo === 'Máquinas' && b.registro_id === maquina_id);
    const eventos = this.data.historial.filter(h => h.maquina_id === maquina_id);

    return {
      maquina,
      asignaciones,
      mantenimientos,
      contratos,
      bitacora,
      eventos
    };
  }

  // BITÁCORA DEL SISTEMA (AUDITORÍA)
  public getBitacora(): BitacoraRegistro[] {
    return this.data.bitacora;
  }

  // DASHBOARD
  public getDashboardStats(): DashboardStats {
    const tecs = this.getTecnicos();
    const maqs = this.getMaquinas();
    const mants = this.getMantenimientos();
    const ctrs = this.getContratos();
    const alertas = this.getAlertas(true);

    const maquinasDisponibles = maqs.filter(m => m.estado === 'Disponible').length;
    const maquinasAsignadas = maqs.filter(m => m.estado === 'Asignada').length;
    const maquinasEnMantenimiento = maqs.filter(m => m.estado === 'En mantenimiento').length;
    const maquinasFueraDeServicio = maqs.filter(m => ['Fuera de servicio', 'Reparación', 'Baja'].includes(m.estado)).length;

    const mantenimientosPendientes = mants.filter(m => ['Programado', 'En proceso'].includes(m.estado)).length;
    const contratosVigentes = ctrs.filter(c => c.estado === 'Vigente').length;
    const contratosProximosVencer = ctrs.filter(c => c.estado === 'Próximo a vencer').length;
    const contratosVencidos = ctrs.filter(c => c.estado === 'Vencido').length;

    // Charts
    const maquinasPorEstadoMap: Record<string, number> = {};
    maqs.forEach(m => {
      maquinasPorEstadoMap[m.estado] = (maquinasPorEstadoMap[m.estado] || 0) + 1;
    });
    const maquinasPorEstado = Object.entries(maquinasPorEstadoMap).map(([estado, cantidad]) => ({ estado, cantidad }));

    const mantenimientosPorTipoMap: Record<string, number> = {};
    mants.forEach(m => {
      mantenimientosPorTipoMap[m.tipo] = (mantenimientosPorTipoMap[m.tipo] || 0) + 1;
    });
    const mantenimientosPorTipo = Object.entries(mantenimientosPorTipoMap).map(([tipo, cantidad]) => ({ tipo, cantidad }));

    const maquinasPorTecnicoMap: Record<string, number> = {};
    this.getAsignaciones().filter(a => a.estado === 'Activa').forEach(a => {
      const nombre = a.tecnico_nombre || 'Técnico';
      maquinasPorTecnicoMap[nombre] = (maquinasPorTecnicoMap[nombre] || 0) + 1;
    });
    const maquinasPorTecnico = Object.entries(maquinasPorTecnicoMap).map(([tecnico, cantidad]) => ({ tecnico, cantidad }));

    const contratosPorEstadoMap: Record<string, number> = {};
    ctrs.forEach(c => {
      contratosPorEstadoMap[c.estado] = (contratosPorEstadoMap[c.estado] || 0) + 1;
    });
    const contratosPorEstado = Object.entries(contratosPorEstadoMap).map(([estado, cantidad]) => ({ estado, cantidad }));

    const anioMantenimientos = new Date().getFullYear();
    const mantenimientosPorMes = mantenimientosFinalizadosPorMes(mants, anioMantenimientos);

    return {
      totalTecnicos: tecs.length,
      totalMaquinas: maqs.length,
      maquinasDisponibles,
      maquinasAsignadas,
      maquinasEnMantenimiento,
      maquinasFueraDeServicio,
      mantenimientosPendientes,
      contratosVigentes,
      contratosProximosVencer,
      contratosVencidos,
      alertasPendientes: alertas.length,
      maquinasPorEstado,
      mantenimientosPorTipo,
      maquinasPorTecnico,
      mantenimientosPorMes,
      anioMantenimientos,
      contratosPorEstado
    };
  }
}

export const dbContext = new AsyncLocalStorage<IndustrialDatabase>();
export const db = new Proxy({} as IndustrialDatabase, {
  get(_target, property) {
    const current = dbContext.getStore();
    if (!current) throw new Error("La operación requiere una transacción MySQL.");
    const value = current[property];
    return typeof value === "function" ? value.bind(current) : value;
  }
});
