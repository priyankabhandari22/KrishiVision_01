export const API = (
  import.meta.env.VITE_API_URL ||
  window.KRISHIVISION_API_URL ||
  window.location.origin
).replace(/\/$/, '');

export const AUTH_ENDPOINT = `${API}/auth`;

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('krishivision_token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });
  let data = {};
  try {
    data = await response.json();
    if (data?.token) {
      localStorage.setItem('krishivision_token', data.token);
    }
  } catch {
    data = {};
  }
  if (path === '/auth/logout') {
    localStorage.removeItem('krishivision_token');
  }
  return { response, data };
}