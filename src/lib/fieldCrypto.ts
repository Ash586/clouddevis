/**
 * Field-level AES-256-GCM encryption for sensitive PII stored in the database.
 *
 * Encrypted format: `enc:v1:<base64(iv[12] || authTag[16] || ciphertext)>`
 * The `enc:v1:` prefix lets us detect already-encrypted values and survive
 * gradual migration (unencrypted legacy values are returned as-is on read).
 *
 * Set FIELD_ENCRYPTION_KEY to a 64-char hex string (32 bytes):
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import crypto from 'node:crypto';

const PREFIX = 'enc:v1:';
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('FIELD_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

/** Encrypt a plaintext string. Returns `enc:v1:…` ciphertext. Idempotent on already-encrypted values. */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined) return null;
  if (plaintext.startsWith(PREFIX)) return plaintext; // already encrypted
  if (plaintext === '') return '';

  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]);
  return PREFIX + payload.toString('base64');
}

/** Decrypt an `enc:v1:…` string. Returns plaintext. Passes through unencrypted legacy values. */
export function decryptField(ciphertext: string | null | undefined): string | null {
  if (ciphertext === null || ciphertext === undefined) return null;
  if (ciphertext === '') return '';
  if (!ciphertext.startsWith(PREFIX)) return ciphertext; // legacy plaintext

  const key = getKey();
  const payload = Buffer.from(ciphertext.slice(PREFIX.length), 'base64');
  const iv = payload.subarray(0, IV_BYTES);
  const authTag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const encrypted = payload.subarray(IV_BYTES + TAG_BYTES);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

/** Encrypt specific keys within a plain object (e.g. companyInfo JSON blob). */
export function encryptObjectFields<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  keys: (keyof T)[]
): T | null {
  if (!obj) return obj ?? null;
  const result = { ...obj };
  for (const k of keys) {
    const val = result[k];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[k as string] = encryptField(val);
    }
  }
  return result;
}

/** Decrypt specific keys within a plain object. */
export function decryptObjectFields<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  keys: (keyof T)[]
): T | null {
  if (!obj) return obj ?? null;
  const result = { ...obj };
  for (const k of keys) {
    const val = result[k];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[k as string] = decryptField(val);
    }
  }
  return result;
}

/** Keys in companyInfo JSON that contain PII / fiscal identifiers. */
export const COMPANY_INFO_SENSITIVE_KEYS = [
  'nif', 'nis', 'rc', 'ai', 'iban', 'rib', 'bankName', 'bankAgency', 'ccpNumber',
] as const;
