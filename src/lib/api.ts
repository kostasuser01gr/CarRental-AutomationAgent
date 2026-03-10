export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cre_token');
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    // Optionally trigger a logout event here
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  
  return response;
}
