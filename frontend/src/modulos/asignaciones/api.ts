import type { Asignacion } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const asignacionesApi = {
  getAsignaciones: () => fetchJson<Asignacion[]>('/asignaciones'),
  crearAsignacion: (data: { tecnico_id: number; maquina_id: number; motivo: string; observaciones?: string; usuario_id?: number }) => 
    fetchJson<Asignacion>('/asignaciones', { method: 'POST', body: JSON.stringify(data) }),
  finalizarAsignacion: (id: number, usuario_id?: number, observaciones?: string) => 
    fetchJson<Asignacion>(`/asignaciones/${id}/finalizar`, { method: 'PUT', body: JSON.stringify({ observaciones, usuario_id }) })
};
