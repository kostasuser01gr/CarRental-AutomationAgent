import { STORAGE_KEYS } from "./constants";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    if (window.location.pathname !== '/login') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
  }
  
  return response;
}
