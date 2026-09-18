import type { Alerta } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const alertasApi = {
  getAlertas: () => fetchJson<Alerta[]>('/alertas'),
  marcarAlertaLeida: (id: number) => fetchJson<Alerta>(`/alertas/${id}/leer`, { method: 'PUT' }),
  marcarTodasAlertasLeidas: () => fetchJson<{ status: string; modificadas: number }>('/alertas/leer-todas', { method: 'PUT' }),
  eliminarAlerta: (id: number) => fetchJson<{ status: string; id: number }>(`/alertas/${id}`, { method: 'DELETE' }),
  limpiarTodasAlertas: (soloLeidas: boolean = false) => fetchJson<{ status: string; eliminadas: number }>(`/alertas${soloLeidas ? '?soloLeidas=true' : ''}`, { method: 'DELETE' }),
  ejecutarRevisionAlertas: () => fetchJson<{ mensaje: string }>('/alertas/ejecutar-revision', { method: 'POST' })
};
