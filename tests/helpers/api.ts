const BASE = 'http://localhost:3000';

export async function api(method: string, path: string, body?: unknown, cookie?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export async function registerUser(data = { email: `test_${Date.now()}@test.com`, password: 'Test123!', name: 'Test User' }) {
  const res = await api('POST', '/api/auth/register', data);
  const setCookie = res.headers.get('set-cookie');
  const cookie = setCookie?.split(';')[0] || '';
  return { res, cookie, data };
}

export async function loginUser(email: string, password: string) {
  const res = await api('POST', '/api/auth/login', { email, password });
  const setCookie = res.headers.get('set-cookie');
  const cookie = setCookie?.split(';')[0] || '';
  return { res, cookie };
}
