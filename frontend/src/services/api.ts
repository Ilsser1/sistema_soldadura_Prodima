import {
  Usuario,
  Tecnico,
  Maquina,
  Asignacion,
  Mantenimiento,
  ContratoMantenimiento,
  Alerta,
  BitacoraRegistro,
  DashboardStats
} from '../../../shared/types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const currentUserRole = localStorage.getItem('active_role') || 'Administrador';
  const currentUsername = localStorage.getItem('active_username') || 'admin';

  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': currentUserRole,
    'x-user-name': currentUsername,
    ...(options?.headers || {})
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Error HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (username: string, password: string) => fetchJson<{ token: string; user: Usuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),

  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard'),

  getUsuarios: () => fetchJson<Usuario[]>('/usuarios'),
  crearUsuario: (u: Partial<Usuario>) => fetchJson<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(u) }),
  actualizarUsuario: (id: number, u: Partial<Usuario>) => fetchJson<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(u) }),
  toggleEstadoUsuario: (id: number) => fetchJson<Usuario>(`/usuarios/${id}/toggle-estado`, { method: 'PUT' }),
  resetPassword: (id: number) => fetchJson<{ mensaje: string }>(`/usuarios/${id}/reset-password`, { method: 'PUT' }),

  getTecnicos: () => fetchJson<Tecnico[]>('/tecnicos'),
  crearTecnico: (t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string }) => 
    fetchJson<Tecnico>('/tecnicos', { method: 'POST', body: JSON.stringify(t) }),
  actualizarTecnico: (id: number, t: Partial<Tecnico> & { username?: string; password?: string; crear_usuario?: boolean }) => 
    fetchJson<Tecnico>(`/tecnicos/${id}`, { method: 'PUT', body: JSON.stringify(t) }),
  eliminarTecnico: (id: number, permanente: boolean = true) => 
    fetchJson<{ mensaje: string; id: number }>(`/tecnicos/${id}?permanente=${permanente}`, { method: 'DELETE' }),
  toggleEstadoTecnico: (id: number) => fetchJson<Tecnico>(`/tecnicos/${id}/toggle-estado`, { method: 'PUT' }),
  desactivarTecnico: (id: number) => fetchJson<{ mensaje: string }>(`/tecnicos/${id}?permanente=false`, { method: 'DELETE' }),

  getMaquinas: () => fetchJson<Maquina[]>('/maquinas'),
  crearMaquina: (m: Partial<Maquina>) => fetchJson<Maquina>('/maquinas', { method: 'POST', body: JSON.stringify(m) }),
  actualizarMaquina: (id: number, m: Partial<Maquina>) => fetchJson<Maquina>(`/maquinas/${id}`, { method: 'PUT', body: JSON.stringify(m) }),
  eliminarMaquina: (id: number, permanente: boolean = true) => 
    fetchJson<{ mensaje: string; id: number }>(`/maquinas/${id}?permanente=${permanente}`, { method: 'DELETE' }),
  darDeBajaMaquina: (id: number) => fetchJson<{ mensaje: string }>(`/maquinas/${id}?permanente=false`, { method: 'DELETE' }),

  getAsignaciones: () => fetchJson<Asignacion[]>('/asignaciones'),
  crearAsignacion: (data: { tecnico_id: number; maquina_id: number; motivo: string; observaciones?: string; usuario_id?: number }) => 
    fetchJson<Asignacion>('/asignaciones', { method: 'POST', body: JSON.stringify(data) }),
  finalizarAsignacion: (id: number, usuario_id?: number, observaciones?: string) => 
    fetchJson<Asignacion>(`/asignaciones/${id}/finalizar`, { method: 'PUT', body: JSON.stringify({ observaciones, usuario_id }) }),

  getMantenimientos: () => fetchJson<Mantenimiento[]>('/mantenimientos'),
  crearMantenimiento: (m: Partial<Mantenimiento>, usuario_id?: number) => fetchJson<Mantenimiento>('/mantenimientos', { method: 'POST', body: JSON.stringify({ ...m, usuario_id }) }),
  actualizarMantenimiento: (id: number, m: Partial<Mantenimiento>, usuario_id?: number) => fetchJson<Mantenimiento>(`/mantenimientos/${id}`, { method: 'PUT', body: JSON.stringify({ ...m, usuario_id }) }),
  eliminarMantenimiento: (id: number) => fetchJson<{ status: string; id: number }>(`/mantenimientos/${id}`, { method: 'DELETE' }),

  getContratos: () => fetchJson<ContratoMantenimiento[]>('/contratos'),
  crearContrato: (c: Partial<ContratoMantenimiento>, usuario_id?: number) => fetchJson<ContratoMantenimiento>('/contratos', { method: 'POST', body: JSON.stringify({ ...c, usuario_id }) }),
  actualizarContrato: (id: number, c: Partial<ContratoMantenimiento>, usuario_id?: number) => fetchJson<ContratoMantenimiento>(`/contratos/${id}`, { method: 'PUT', body: JSON.stringify({ ...c, usuario_id }) }),

  getAlertas: () => fetchJson<Alerta[]>('/alertas'),
  marcarAlertaLeida: (id: number) => fetchJson<Alerta>(`/alertas/${id}/leer`, { method: 'PUT' }),
  marcarTodasAlertasLeidas: () => fetchJson<{ status: string; modificadas: number }>('/alertas/leer-todas', { method: 'PUT' }),
  eliminarAlerta: (id: number) => fetchJson<{ status: string; id: number }>(`/alertas/${id}`, { method: 'DELETE' }),
  limpiarTodasAlertas: (soloLeidas: boolean = false) => fetchJson<{ status: string; eliminadas: number }>(`/alertas${soloLeidas ? '?soloLeidas=true' : ''}`, { method: 'DELETE' }),
  ejecutarRevisionAlertas: () => fetchJson<{ mensaje: string }>('/alertas/ejecutar-revision', { method: 'POST' }),

  getHistorialMaquina: (id: number) => fetchJson<any>(`/historial/maquina/${id}`),

  getBitacora: () => fetchJson<BitacoraRegistro[]>('/bitacora'),

  getReportesData: () => fetchJson<any>('/reportes'),

  limpiarTodoSistema: () => fetchJson<{ mensaje: string }>('/sistema/limpiar-todo', { method: 'POST' }),
  restablecerDatosEjemplo: () => fetchJson<{ mensaje: string }>('/sistema/restablecer-ejemplos', { method: 'POST' })
};
