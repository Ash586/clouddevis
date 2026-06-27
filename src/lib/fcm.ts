// ============================================================
// CloudDevis — Firebase Cloud Messaging (server-side)
// Sends push notifications to Android via FCM HTTP v1 API.
//
// Required env vars:
//   FIREBASE_PROJECT_ID        — Firebase project ID
//   FIREBASE_CLIENT_EMAIL      — Service account email
//   FIREBASE_PRIVATE_KEY       — Service account private key (PEM)
//
// If any env var is missing, sendPush() is a no-op and returns false.
// ============================================================

// ── Types ─────────────────────────────────────────────────────

export interface PushPayload {
  /** FCM device token (stored in User.fcmToken) */
  token: string;
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Custom data forwarded to the app */
  data?: Record<string, string>;
}

// ── Internal: OAuth2 token cache ─────────────────────────────

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase env vars not configured');
  }

  // JWT for Google OAuth2
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  // Sign with RS256
  const { createSign } = await import('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${claims}`);
  const signature = sign.sign(privateKey, 'base64url');

  const jwt = `${header}.${claims}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) throw new Error(`OAuth2 token error: ${res.status}`);
  const json = await res.json() as { access_token: string; expires_in: number };

  cachedToken = json.access_token;
  tokenExpiry = Date.now() + json.expires_in * 1000;
  return cachedToken;
}

// ── Public: send one notification ────────────────────────────

/**
 * Send a push notification to a single FCM token.
 * Returns `true` on success, `false` if FCM is not configured or delivery failed.
 */
export async function sendPush(payload: PushPayload): Promise<boolean> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    return false; // graceful no-op when FCM is not configured
  }

  try {
    const accessToken = await getAccessToken();
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: payload.token,
            notification: { title: payload.title, body: payload.body },
            data: payload.data ?? {},
            android: {
              priority: 'high',
              notification: {
                channel_id: 'clouddevis_default',
                sound: 'default',
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
              },
            },
          },
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ── Notification templates ────────────────────────────────────

/** Facture approved / accepted by client */
export function invoiceApprovedPush(token: string, invoiceNumber: string, documentId: string): PushPayload {
  return {
    token,
    title: '✅ Facture approuvée',
    body: `La facture ${invoiceNumber} a été approuvée.`,
    data: { type: 'invoice_approved', documentId },
  };
}

/** Devis accepted */
export function devisAcceptedPush(token: string, devisNumber: string, documentId: string): PushPayload {
  return {
    token,
    title: '🤝 Devis accepté',
    body: `Le devis ${devisNumber} a été accepté par le client.`,
    data: { type: 'devis_accepted', documentId },
  };
}

/** Payment received / invoice delivered */
export function paymentReceivedPush(token: string, invoiceNumber: string, amount: string, documentId: string): PushPayload {
  return {
    token,
    title: '💰 Paiement reçu',
    body: `Paiement de ${amount} DA reçu pour la facture ${invoiceNumber}.`,
    data: { type: 'invoice_paid', documentId },
  };
}

/** Generic payment reminder */
export function paymentReminderPush(token: string, invoiceNumber: string, daysOverdue: number, documentId: string): PushPayload {
  return {
    token,
    title: '⚠️ Rappel de paiement',
    body: `La facture ${invoiceNumber} est en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}.`,
    data: { type: 'reminder', documentId, daysOverdue: String(daysOverdue) },
  };
}
