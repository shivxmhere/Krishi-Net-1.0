/** Authenticated JSON requests for community/marketplace modules. */
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

export async function ecosystemRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('krishi_net_token');
  if (!token || token.startsWith('offline_token_')) throw new Error('Sign in to continue');
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach Krishi-Net. Check your connection and try again.');
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.detail;
    throw new Error(typeof detail === 'string' ? detail : `Request failed (HTTP ${response.status})`);
  }
  return body as T;
}
