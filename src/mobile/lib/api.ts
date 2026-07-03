// ============================================================
// CloudDevis Mobile — API Client
// Thin typed wrapper around the Next.js REST API.
// Capacitor webview loads from the same origin as the server,
// so relative paths work in both prod (Vercel) and dev (localhost).
// Session cookie is sent automatically via credentials:'include'.
// ============================================================

import type { Client, Company, Document, DocumentType } from '@/mobile/types';

// ── Error type ────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Core fetch wrapper ────────────────────────────────────────

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }
  return res.json() as Promise<T>;
}

// ── Clients ───────────────────────────────────────────────────

export interface ApiClientRecord {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  nif: string | null;
  rc: string | null;
  nis: string | null;
  ai: string | null;
}

interface ClientsResponse {
  clients: ApiClientRecord[];
  pagination: { total: number; totalPages: number; page: number; limit: number };
}

export async function fetchAllClients(): Promise<ApiClientRecord[]> {
  // Fetch up to 200 clients (enough for mobile use)
  const data = await request<ClientsResponse>('/api/clients?page=1&limit=200');
  return data.clients;
}

export async function createApiClient(
  data: Omit<Client, 'id'>
): Promise<{ id: string; name: string; updated?: boolean }> {
  return request('/api/clients', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      nif: data.nif,
      rc: data.rc,
      nis: data.nis,
      ai: data.nis, // map nis used for ai in mobile type
    }),
  });
}

export async function updateApiClient(
  id: string,
  data: Partial<Omit<Client, 'id'>>
): Promise<void> {
  await request(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteApiClient(id: string): Promise<void> {
  await request(`/api/clients/${id}`, { method: 'DELETE' });
}

// ── Documents ─────────────────────────────────────────────────

const TYPE_MAP: Record<DocumentType, string> = {
  DEVIS: 'devis',
  FACTURE: 'facture',
  PROFORMA: 'proforma',
  BC: 'bc',
  BR: 'br',
  BL: 'bl',
};

/** Convert a mobile Document to the shape the /api/documents POST endpoint expects. */
function toApiDocumentBody(doc: Document) {
  // Use the TVA rate from the first item (all items should have the same base rate)
  const tvaRate = doc.items[0]?.tvaRate ?? 19;
  return {
    documentType: TYPE_MAP[doc.type] ?? 'devis',
    items: doc.items.map((item) => ({
      id: item.id,
      designation: item.label,
      code: item.code ?? null,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      tvaRate: item.tvaRate,
      remise: item.remise ?? null,
      category: null,
    })),
    tvaRate,
    discount: { type: 'percentage', value: 0, reason: '' },
    stampDuty: { rate: 1, minAmount: 5, maxAmount: 2500 },
    paymentMode: doc.paymentMode,
    acompte: doc.acompte ?? 0,
    notes: doc.notes,
    clientInfo: {
      name: doc.client.name,
      phone: doc.client.phone,
      email: doc.client.email,
      address: doc.client.address,
      nif: doc.client.nif,
    },
    companyInfo: {
      name: doc.company.name,
      nif: doc.company.nif,
      rc: doc.company.rc,
      nis: doc.company.nis,
      ai: doc.company.ai,
      address: doc.company.address,
      phone: doc.company.phone,
      capital: doc.company.capital,
      logo: doc.company.logo,
    },
  };
}

export interface ApiDocumentDetail {
  id: string;
  type: string;
  number: string;
  status: string;
  date: string;          // ISO DateTime
  acompte: number;
  totalTTC: number;
  timbreFiscal: number;
  notes: string | null;
  paymentMode: string;
  items: string;         // JSON string of line items
  companyInfo: Record<string, unknown> | null;
  client: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    nif: string | null;
    rc: string | null;
    nis: string | null;
    ai: string | null;
  } | null;
}

export async function fetchDocumentDetail(id: string): Promise<ApiDocumentDetail> {
  const res = await request<{ document: ApiDocumentDetail }>(`/api/documents/${id}`);
  return res.document;
}

export async function createApiDocument(
  doc: Document
): Promise<{ id: string; number: string }> {
  const res = await request<{ document: { id: string; number: string } }>(
    '/api/documents',
    { method: 'POST', body: JSON.stringify(toApiDocumentBody(doc)) }
  );
  return res.document;
}

export async function updateApiDocument(
  id: string,
  doc: Document
): Promise<void> {
  await request(`/api/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toApiDocumentBody(doc)),
  });
}

export async function deleteApiDocument(id: string): Promise<void> {
  await request(`/api/documents/${id}`, { method: 'DELETE' });
}

// ── Documents (list) ─────────────────────────────────────────

export interface ApiDocumentListItem {
  id: string;
  number: string;
  type: string;
  status: string;
  client: string;       // client name
  clientNif: string | null;
  total: number;        // totalTTC
  timbreAmount: number;
  acompte: number;
  date: string;         // localized "fr-DZ"
  dateISO: string;      // raw ISO string for date arithmetic
}

interface DocumentsListResponse {
  documents: ApiDocumentListItem[];
  pagination: { total: number; totalPages: number; page: number; limit: number };
}

export async function fetchDocuments(page = 1, limit = 100): Promise<ApiDocumentListItem[]> {
  const data = await request<DocumentsListResponse>(
    `/api/documents?page=${page}&limit=${limit}&sortBy=date&sortOrder=desc`
  );
  return data.documents;
}

// ── Auth ──────────────────────────────────────────────────────

export async function loginApi(
  email: string,
  password: string,
  rememberMe = false
): Promise<{ id: string; name: string; email: string }> {
  const res = await request<{ success: boolean; user: { id: string; name: string; email: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) }
  );
  return res.user;
}

export async function logoutApi(): Promise<void> {
  await request('/api/auth/logout', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<{
  id: string;
  name: string;
  email: string;
  mode: 'ARTISAN' | 'ENTREPRISE';
}> {
  const res = await request<{
    user: { id: string; name: string; email: string; mode?: string };
  }>('/api/user/profile');
  return {
    ...res.user,
    mode: res.user.mode === 'ENTREPRISE' ? 'ENTREPRISE' : 'ARTISAN',
  };
}

/** Update the account mode (Artisan ↔ Entreprise). */
export async function updateUserMode(mode: 'ARTISAN' | 'ENTREPRISE'): Promise<void> {
  await request('/api/user/profile', { method: 'PUT', body: JSON.stringify({ mode }) });
}

// ── Profile / Company ─────────────────────────────────────────

export async function updateCompanyProfile(company: Company): Promise<void> {
  await request('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify({
      companyInfo: {
        name: company.name,
        nif: company.nif,
        rc: company.rc,
        nis: company.nis,
        ai: company.ai,
        phone: company.phone,
        address: company.address,
        capital: company.capital,
        logo: company.logo,
      },
    }),
  });
}
