const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('prodima_auth_token') || ''),
    ...(options?.headers || {})
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (res.status === 401 && url !== '/auth/login') {
    localStorage.removeItem('prodima_auth_token');
    localStorage.removeItem('prodima_auth_user');
    window.dispatchEvent(new Event('session-expired'));
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Error HTTP ${res.status}`);
  }
  return res.json();
}
