import type { Usuario } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const autenticacionApi = {
  login: (username: string, password: string) => fetchJson<{ token: string; user: Usuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
};
