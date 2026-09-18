import type { Maquina } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const maquinasApi = {
  getMaquinas: () => fetchJson<Maquina[]>('/maquinas'),
  crearMaquina: (m: Partial<Maquina>) => fetchJson<Maquina>('/maquinas', { method: 'POST', body: JSON.stringify(m) }),
  actualizarMaquina: (id: number, m: Partial<Maquina>) => fetchJson<Maquina>(`/maquinas/${id}`, { method: 'PUT', body: JSON.stringify(m) }),
  eliminarMaquina: (id: number, permanente: boolean = true) => 
    fetchJson<{ mensaje: string; id: number }>(`/maquinas/${id}?permanente=${permanente}`, { method: 'DELETE' }),
  darDeBajaMaquina: (id: number) => fetchJson<{ mensaje: string }>(`/maquinas/${id}?permanente=false`, { method: 'DELETE' })
};
