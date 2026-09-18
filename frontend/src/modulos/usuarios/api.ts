import type { Usuario } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const usuariosApi = {
  getUsuarios: () => fetchJson<Usuario[]>('/usuarios'),
  crearUsuario: (u: Partial<Usuario>) => fetchJson<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(u) }),
  actualizarUsuario: (id: number, u: Partial<Usuario>) => fetchJson<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(u) }),
  toggleEstadoUsuario: (id: number) => fetchJson<Usuario>(`/usuarios/${id}/toggle-estado`, { method: 'PUT' })
};
