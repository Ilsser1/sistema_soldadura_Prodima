import { fetchJson } from '../../services/http';

export const sistemaApi = {
  limpiarTodoSistema: () => fetchJson<{ mensaje: string }>('/sistema/limpiar-todo', { method: 'POST' })
};
