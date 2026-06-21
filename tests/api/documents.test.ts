import { describe, test, expect } from 'vitest';
import { api, registerUser } from '../helpers/api';

describe('Documents API', () => {
  let cookie: string;

  test('GET /api/documents - returns array, authenticated', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('GET', '/api/documents', undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/documents - creates document → 201', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    expect(res.status).toBe(201);
  });

  test('GET /api/documents/:id - returns document', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    const created = await createRes.json();
    const res = await api('GET', `/api/documents/${created.id}`, undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(created.id);
  });

  test('PUT /api/documents/:id - updates document', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    const created = await createRes.json();
    const res = await api('PUT', `/api/documents/${created.id}`, {
      client: { name: 'Updated Client', email: 'updated@test.com' }
    }, cookie);
    expect(res.status).toBe(200);
  });

  test('DELETE /api/documents/:id - deletes → 200', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    const created = await createRes.json();
    const res = await api('DELETE', `/api/documents/${created.id}`, undefined, cookie);
    expect(res.status).toBe(200);
  });

  test('GET /api/documents/:id - non-existent → 404', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const res = await api('GET', '/api/documents/nonexistent-id', undefined, cookie);
    expect(res.status).toBe(404);
  });

  test('POST /api/documents with sourceId - duplicates', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    const created = await createRes.json();
    const res = await api('POST', '/api/documents', {
      type: 'FACTURE',
      sourceId: created.id,
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    expect(res.status).toBe(201);
  });

  test('GET /api/documents without auth → 401', async () => {
    const res = await api('GET', '/api/documents');
    expect(res.status).toBe(401);
  });

  test('PATCH /api/documents - changes status', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    const createRes = await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    const created = await createRes.json();
    const res = await api('PATCH', `/api/documents/${created.id}`, {
      status: 'SENT'
    }, cookie);
    expect(res.status).toBe(200);
  });

  test('GET /api/documents?type=FACTURE - filtered list', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await registerUser({ email, password: 'Test123!', name: 'Test User' });
    cookie = result.cookie;
    await api('POST', '/api/documents', {
      type: 'FACTURE',
      client: { name: 'Test Client', email: 'client@test.com' },
      items: [{ description: 'Test Item', quantity: 1, unitPrice: 100 }]
    }, cookie);
    const res = await api('GET', '/api/documents?type=FACTURE', undefined, cookie);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    data.forEach((doc: { type: string }) => {
      expect(doc.type).toBe('FACTURE');
    });
  });
});
