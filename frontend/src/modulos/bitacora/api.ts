import type { BitacoraRegistro } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const bitacoraApi = {
  getBitacora: () => fetchJson<BitacoraRegistro[]>('/bitacora')
};
