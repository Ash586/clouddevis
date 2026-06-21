import { describe, test, expect } from 'vitest';
import { api, registerUser } from '../helpers/api';

describe('Clients API', () => {
  let cookie: string;

  test('GET /api/clients - returns array', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('GET', '/api/clients', undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/clients - creates → 201', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('POST', '/api/clients', {
      name: 'Test Client',
      email: 'client@test.com',
      nif: '1234567890123'
    }, cookie);
    expect(res.status).toBe(201);
  });

  test('GET /api/clients/:id - returns client', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/clients', {
      name: 'Test Client',
      email: 'client@test.com',
      nif: '1234567890123'
    }, cookie);
    const created = await createRes.json();
    const res = await api('GET', `/api/clients/${created.id}`, undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(created.id);
  });

  test('PUT /api/clients/:id - updates', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/clients', {
      name: 'Test Client',
      email: 'client@test.com',
      nif: '1234567890123'
    }, cookie);
    const created = await createRes.json();
    const res = await api('PUT', `/api/clients/${created.id}`, {
      name: 'Updated Client',
      email: 'updated@test.com'
    }, cookie);
    expect(res.status).toBe(200);
  });

  test('DELETE /api/clients/:id - deletes', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/clients', {
      name: 'Test Client',
      email: 'client@test.com',
      nif: '1234567890123'
    }, cookie);
    const created = await createRes.json();
    const res = await api('DELETE', `/api/clients/${created.id}`, undefined, cookie);
    expect(res.status).toBe(200);
  });

  test('POST /api/clients with invalid NIF → validation error', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('POST', '/api/clients', {
      name: 'Test Client',
      email: 'client@test.com',
      nif: 'invalid'
    }, cookie);
    expect(res.status).toBe(400);
  });
});
