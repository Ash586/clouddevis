// CloudDevis Mobile — SQLite Helper
// Offline-first local database using @capacitor-community/sqlite

import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
const DB_NAME = 'clouddevis';

let db: SQLiteDBConnection | null = null;

export async function initDatabase(): Promise<SQLiteDBConnection> {
  if (db) return db;

  db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
  await db.open();

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nif TEXT,
      nis TEXT,
      rc TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      number TEXT,
      client_id TEXT,
      client_name TEXT,
      data TEXT NOT NULL,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

export function getDB(): SQLiteDBConnection {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// Client operations
export async function saveClient(client: {
  id: string;
  name: string;
  nif?: string;
  nis?: string;
  rc?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<void> {
  const db = await initDatabase();
  await db.run(
    `INSERT OR REPLACE INTO clients (id, name, nif, nis, rc, phone, email, address, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [client.id, client.name, client.nif ?? null, client.nis ?? null, client.rc ?? null, client.phone ?? null, client.email ?? null, client.address ?? null]
  );
}

export async function searchClients(query: string): Promise<any[]> {
  const db = await initDatabase();
  const result = await db.query(
    `SELECT * FROM clients WHERE name LIKE ? OR nif LIKE ? OR phone LIKE ? ORDER BY name LIMIT 20`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  return result.values ?? [];
}

// Document operations
export async function saveDocument(doc: {
  id: string;
  type: string;
  number?: string;
  clientId?: string;
  clientName?: string;
  data: string;
  total?: number;
  status?: string;
}): Promise<void> {
  const db = await initDatabase();
  await db.run(
    `INSERT OR REPLACE INTO documents (id, type, number, client_id, client_name, data, total, status, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [doc.id, doc.type, doc.number ?? null, doc.clientId ?? null, doc.clientName ?? null, doc.data, doc.total ?? 0, doc.status ?? 'draft']
  );
}

export async function getDocuments(limit: number = 50): Promise<any[]> {
  const db = await initDatabase();
  const result = await db.query(
    `SELECT * FROM documents ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return result.values ?? [];
}

export async function getUnsyncedDocuments(): Promise<any[]> {
  const db = await initDatabase();
  const result = await db.query(`SELECT * FROM documents WHERE synced = 0`);
  return result.values ?? [];
}

export async function markSynced(id: string): Promise<void> {
  const db = await initDatabase();
  await db.run(`UPDATE documents SET synced = 1 WHERE id = ?`, [id]);
}
