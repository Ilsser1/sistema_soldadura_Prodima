import { fetchJson } from '../../services/http';

export const historialApi = {
  getHistorialMaquina: (id: number) => fetchJson<any>(`/historial/maquina/${id}`)
};
