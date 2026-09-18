const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const currentUserRole = localStorage.getItem('active_role') || 'Administrador';
  const currentUsername = localStorage.getItem('active_username') || 'admin';

  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': currentUserRole,
    'x-user-name': currentUsername,
    ...(options?.headers || {})
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Error HTTP ${res.status}`);
  }
  return res.json();
}
