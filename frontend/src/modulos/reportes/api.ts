import { fetchJson } from '../../services/http';

export const reportesApi = {
  getReportesData: () => fetchJson<any>('/reportes')
};
