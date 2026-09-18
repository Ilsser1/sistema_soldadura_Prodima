import type { Tecnico } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const tecnicosApi = {
  getTecnicos: () => fetchJson<Tecnico[]>('/tecnicos'),
  crearTecnico: (t: Partial<Tecnico> & { crear_usuario?: boolean; username?: string; password?: string }) => 
    fetchJson<Tecnico>('/tecnicos', { method: 'POST', body: JSON.stringify(t) }),
  actualizarTecnico: (id: number, t: Partial<Tecnico> & { username?: string; password?: string; crear_usuario?: boolean }) => 
    fetchJson<Tecnico>(`/tecnicos/${id}`, { method: 'PUT', body: JSON.stringify(t) }),
  eliminarTecnico: (id: number, permanente: boolean = true) => 
    fetchJson<{ mensaje: string; id: number }>(`/tecnicos/${id}?permanente=${permanente}`, { method: 'DELETE' }),
  toggleEstadoTecnico: (id: number) => fetchJson<Tecnico>(`/tecnicos/${id}/toggle-estado`, { method: 'PUT' }),
  desactivarTecnico: (id: number) => fetchJson<{ mensaje: string }>(`/tecnicos/${id}?permanente=false`, { method: 'DELETE' })
};
