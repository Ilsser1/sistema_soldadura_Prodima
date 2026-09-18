import type { ContratoMantenimiento } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const contratosApi = {
  getContratos: () => fetchJson<ContratoMantenimiento[]>('/contratos'),
  crearContrato: (c: Partial<ContratoMantenimiento>, usuario_id?: number) => fetchJson<ContratoMantenimiento>('/contratos', { method: 'POST', body: JSON.stringify({ ...c, usuario_id }) }),
  actualizarContrato: (id: number, c: Partial<ContratoMantenimiento>, usuario_id?: number) => fetchJson<ContratoMantenimiento>(`/contratos/${id}`, { method: 'PUT', body: JSON.stringify({ ...c, usuario_id }) })
};
