import { describe, test, expect } from 'vitest';
import { api, registerUser } from '../helpers/api';

describe('Teams API', () => {
  let cookie: string;

  test('POST /api/teams - creates team → 201', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('POST', '/api/teams', {
      name: 'Test Team',
      description: 'A test team'
    }, cookie);
    expect(res.status).toBe(201);
  });

  test('GET /api/teams - returns array', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('GET', '/api/teams', undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /api/teams/:id - returns team', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/teams', {
      name: 'Test Team',
      description: 'A test team'
    }, cookie);
    const created = await createRes.json();
    const res = await api('GET', `/api/teams/${created.id}`, undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(created.id);
  });

  test('DELETE /api/teams/:id - deletes', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/teams', {
      name: 'Test Team',
      description: 'A test team'
    }, cookie);
    const created = await createRes.json();
    const res = await api('DELETE', `/api/teams/${created.id}`, undefined, cookie);
    expect(res.status).toBe(200);
  });

  test('GET /api/teams without auth → 401', async () => {
    const res = await api('GET', '/api/teams');
    expect(res.status).toBe(401);
  });
});
