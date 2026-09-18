import type { Mantenimiento } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const mantenimientosApi = {
  getMantenimientos: () => fetchJson<Mantenimiento[]>('/mantenimientos'),
  crearMantenimiento: (m: Partial<Mantenimiento>, usuario_id?: number) => fetchJson<Mantenimiento>('/mantenimientos', { method: 'POST', body: JSON.stringify({ ...m, usuario_id }) }),
  actualizarMantenimiento: (id: number, m: Partial<Mantenimiento>, usuario_id?: number) => fetchJson<Mantenimiento>(`/mantenimientos/${id}`, { method: 'PUT', body: JSON.stringify({ ...m, usuario_id }) }),
  eliminarMantenimiento: (id: number) => fetchJson<{ status: string; id: number }>(`/mantenimientos/${id}`, { method: 'DELETE' })
};
