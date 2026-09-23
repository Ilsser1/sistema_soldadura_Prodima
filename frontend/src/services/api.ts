import type { Alerta, Asignacion, BitacoraRegistro, ContratoMantenimiento, DashboardStats, HistorialCompletoMaquina, Mantenimiento, Maquina, Tecnico, Usuario } from '../../../shared/types';
import { fetchJson } from './http';

export const api = {
  getAlertas: () => fetchJson<Alerta[]>('/alertas'),
  marcarAlertaLeida: (id: number) => fetchJson<Alerta>(`/alertas/${id}/leer`, { method: 'PUT' }),
  marcarTodasAlertasLeidas: () => fetchJson<{ status: string; modificadas: number }>('/alertas/leer-todas', { method: 'PUT' }),
  eliminarAlerta: (id: number) => fetchJson<{ status: string; id: number }>(`/alertas/${id}`, { method: 'DELETE' }),
  limpiarTodasAlertas: (soloLeidas: boolean = false) => fetchJson<{ status: string; eliminadas: number }>(`/alertas${soloLeidas ? '?soloLeidas=true' : ''}`, { method: 'DELETE' }),

  getAsignaciones: () => fetchJson<Asignacion[]>('/asignaciones'),
  crearAsignacion: (data: { tecnico_id: number; maquina_id: number; motivo: string; observaciones?: string }) =>
    fetchJson<Asignacion>('/asignaciones', { method: 'POST', body: JSON.stringify(data) }),
  finalizarAsignacion: (id: number, observaciones?: string) =>
    fetchJson<Asignacion>(`/asignaciones/${id}/finalizar`, { method: 'PUT', body: JSON.stringify({ observaciones }) }),

  login: (username: string, password: string) => fetchJson<{ token: string; user: Usuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),

  logout: () => fetchJson<{ status: string }>('/auth/logout', { method: 'POST' }),

  getBitacora: () => fetchJson<BitacoraRegistro[]>('/bitacora'),

  getContratos: () => fetchJson<ContratoMantenimiento[]>('/contratos'),
  crearContrato: (c: Partial<ContratoMantenimiento>) => fetchJson<ContratoMantenimiento>('/contratos', { method: 'POST', body: JSON.stringify(c) }),
  actualizarContrato: (id: number, c: Partial<ContratoMantenimiento>) => fetchJson<ContratoMantenimiento>(`/contratos/${id}`, { method: 'PUT', body: JSON.stringify(c) }),

  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard'),

  getHistorialMaquina: (id: number) => fetchJson<HistorialCompletoMaquina>(`/historial/maquina/${id}`),

  getMantenimientos: () => fetchJson<Mantenimiento[]>('/mantenimientos'),
  crearMantenimiento: (m: Partial<Mantenimiento>) => fetchJson<Mantenimiento>('/mantenimientos', { method: 'POST', body: JSON.stringify(m) }),
  actualizarMantenimiento: (id: number, m: Partial<Mantenimiento>) => fetchJson<Mantenimiento>(`/mantenimientos/${id}`, { method: 'PUT', body: JSON.stringify(m) }),
  eliminarMantenimiento: (id: number) => fetchJson<{ status: string; id: number }>(`/mantenimientos/${id}`, { method: 'DELETE' }),

  getMaquinas: () => fetchJson<Maquina[]>('/maquinas'),
  crearMaquina: (m: Partial<Maquina>) => fetchJson<Maquina>('/maquinas', { method: 'POST', body: JSON.stringify(m) }),
  actualizarMaquina: (id: number, m: Partial<Maquina>) => fetchJson<Maquina>(`/maquinas/${id}`, { method: 'PUT', body: JSON.stringify(m) }),
  eliminarMaquina: (id: number, permanente: boolean = true) =>
    fetchJson<{ mensaje: string; id: number }>(`/maquinas/${id}?permanente=${permanente}`, { method: 'DELETE' }),
  darDeBajaMaquina: (id: number) => fetchJson<{ mensaje: string }>(`/maquinas/${id}?permanente=false`, { method: 'DELETE' }),

  limpiarTodoSistema: () => fetchJson<{ mensaje: string }>('/sistema/limpiar-todo', { method: 'POST' }),

  getTecnicos: () => fetchJson<Tecnico[]>('/tecnicos'),
  crearTecnico: (t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string }) =>
    fetchJson<Tecnico>('/tecnicos', { method: 'POST', body: JSON.stringify(t) }),
  actualizarTecnico: (id: number, t: Partial<Tecnico> & { username?: string; password?: string; crear_usuario?: boolean }) =>
    fetchJson<Tecnico>(`/tecnicos/${id}`, { method: 'PUT', body: JSON.stringify(t) }),
  eliminarTecnico: (id: number, permanente: boolean = true) =>
    fetchJson<{ mensaje: string; id: number }>(`/tecnicos/${id}?permanente=${permanente}`, { method: 'DELETE' }),

  getUsuarios: () => fetchJson<Usuario[]>('/usuarios'),
  crearUsuario: (u: Partial<Usuario>) => fetchJson<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(u) }),
  actualizarUsuario: (id: number, u: Partial<Usuario>) => fetchJson<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(u) })
};
