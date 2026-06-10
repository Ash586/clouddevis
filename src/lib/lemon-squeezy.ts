const LS_API = 'https://api.lemonsqueezy.com/v1';

function getHeaders() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error('LEMONSQUEEZY_API_KEY not set');
  return { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
}

export interface LSCheckoutOptions {
  productId: string;
  variantId: string;
  email: string;
  name: string;
  metadata?: Record<string, string>;
  redirectUrl?: string;
}

export async function createCheckout(opts: LSCheckoutOptions) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID not set');

  const body: Record<string, any> = {
    data: {
      type: 'checkouts',
      attributes: {
        product_options: { redirect_url: opts.redirectUrl },
        checkout_data: { email: opts.email, name: opts.name, custom: opts.metadata },
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        variant: { data: { type: 'variants', id: opts.variantId } },
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(`${LS_API}/checkouts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body), signal: controller.signal });
  clearTimeout(timeout);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors?.[0]?.detail || 'LS checkout failed');
  return json.data as { id: string; attributes: { url: string } };
}

export interface LSWebhookPayload {
  meta: { event_name: string; custom_data?: Record<string, string> };
  data: { id: string; attributes: Record<string, any> };
}

import { createHmac, timingSafeEqual } from 'crypto';

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function parseWebhookEvent(payload: LSWebhookPayload): { event: string; orderId: string; status: string; email: string; userId?: string; planId?: string } {
  if (!payload?.meta?.event_name) {
    throw new Error('Invalid webhook payload: missing meta.event_name');
  }
  const event = payload.meta.event_name;
  const attrs = payload.data.attributes;
  const customData = payload.meta.custom_data || {};

  return {
    event,
    orderId: payload.data.id,
    status: attrs.status,
    email: attrs.user_email || customData.email || '',
    userId: customData.userId,
    planId: customData.planId,
  };
}

export const PLAN_VARIANTS: Record<string, string> = {
  standard: process.env.LS_VARIANT_STANDARD || '',
  pro: process.env.LS_VARIANT_PRO || '',
  max: process.env.LS_VARIANT_MAX || '',
};

export const PRODUCT_ID = process.env.LEMONSQUEEZY_PRODUCT_ID || '';
