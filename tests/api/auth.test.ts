import { describe, test, expect } from 'vitest';
import { api, registerUser, loginUser } from '../helpers/api';

describe('Auth API', () => {
  test('POST /api/auth/register - valid registration → 201', async () => {
    const email = `test_${Date.now()}@test.com`;
    const { res, cookie } = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(cookie).toBeTruthy();
  });

  test('POST /api/auth/register - duplicate email → 409', async () => {
    const email = `test_${Date.now()}@test.com`;
    await registerUser({ email, password: 'Test123!', name: 'Test User' });
    const { res } = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register - weak password → 400', async () => {
    const email = `test_${Date.now()}@test.com`;
    const res = await api('POST', '/api/auth/register', { email, password: 'weak', name: 'Test User' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register - missing name → 400', async () => {
    const email = `test_${Date.now()}@test.com`;
    const res = await api('POST', '/api/auth/register', { email, password: 'Test123!' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login - valid credentials → 200', async () => {
    const email = `test_${Date.now()}@test.com`;
    await registerUser({ email, password: 'Test123!', name: 'Test User' });
    const { res, cookie } = await loginUser(email, 'Test123!');
    expect(res.status).toBe(200);
    expect(cookie).toBeTruthy();
  });

  test('POST /api/auth/login - wrong password → 401', async () => {
    const email = `test_${Date.now()}@test.com`;
    await registerUser({ email, password: 'Test123!', name: 'Test User' });
    const { res } = await loginUser(email, 'WrongPass123!');
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login - non-existent user → 401', async () => {
    const { res } = await loginUser(`nonexistent_${Date.now()}@test.com`, 'Test123!');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - authenticated → 200 + user data', async () => {
    const email = `test_${Date.now()}@test.com`;
    const { cookie } = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    const res = await api('GET', '/api/auth/me', undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('email', email);
  });

  test('GET /api/auth/me - no cookie → 401', async () => {
    const res = await api('GET', '/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/logout - clears cookie → 200', async () => {
    const email = `test_${Date.now()}@test.com`;
    const { cookie } = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    const res = await api('POST', '/api/auth/logout', undefined, cookie);
    expect(res.status).toBe(200);
  });

  test('POST /api/auth/forgot-password - valid email → 200', async () => {
    const email = `test_${Date.now()}@test.com`;
    await registerUser({ email, password: 'Test123!', name: 'Test User' });
    const res = await api('POST', '/api/auth/forgot-password', { email });
    expect(res.status).toBe(200);
  });

  test('POST /api/auth/reset-password - invalid token → 400', async () => {
    const res = await api('POST', '/api/auth/reset-password', { token: 'invalid-token', password: 'NewPass123!' });
    expect(res.status).toBe(400);
  });
});
