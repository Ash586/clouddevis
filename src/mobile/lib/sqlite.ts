// Rakmana Mobile — SQLite Helper (stub)
// Capacitor SQLite removed — app uses API calls for data.

export interface LocalClientRow {
  id: string;
  name: string;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  synced: number;
  created_at: string;
  updated_at: string;
}

export interface LocalDocumentRow {
  id: string;
  type: string;
  number: string | null;
  client_id: string | null;
  client_name: string | null;
  data: string;
  total: number;
  status: string;
  synced: number;
  created_at: string;
  updated_at: string;
}

export async function getUnsyncedDocuments(): Promise<LocalDocumentRow[]> {
  return [];
}

export async function markSynced(_id: string): Promise<void> {
  // no-op
}
