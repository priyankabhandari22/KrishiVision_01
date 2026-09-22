export const API = (
  import.meta.env.VITE_API_URL ||
  window.KRISHIVISION_API_URL ||
  window.location.origin
).replace(/\/$/, '');

export const AUTH_ENDPOINT = `${API}/auth`;

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: options.body instanceof FormData
      ? (options.headers || {})
      : { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  return { response, data };
}