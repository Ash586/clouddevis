type EventProps = Record<string, string | number | boolean>;

type PlausibleFn = (event: string, opts?: { props?: EventProps; callback?: () => void }) => void;

declare global {
  interface Window { plausible?: PlausibleFn; __plausibleQueue?: [string, EventProps | undefined][] }
}

export const PLAUSIBLE_DOMAIN = 'clouddevis.app';

export function loadPlausible() {
  if (typeof window === 'undefined') return;
  if (document.querySelector('script[data-domain="' + PLAUSIBLE_DOMAIN + '"]')) return;
  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = PLAUSIBLE_DOMAIN;
  s.src = 'https://plausible.io/js/script.tagged-events.js';
  s.onload = () => {
    const q = window.__plausibleQueue;
    if (q) {
      q.forEach(([ev, p]) => window.plausible?.(ev, p ? { props: p } : undefined));
      window.__plausibleQueue = [];
    }
  };
  document.head.appendChild(s);
}

export function track(event: string, props?: EventProps) {
  if (typeof window === 'undefined') return;
  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  } else {
    if (!window.__plausibleQueue) window.__plausibleQueue = [];
    window.__plausibleQueue.push([event, props]);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Plausible queued]', event, props ?? '');
    }
  }
}

export const PAGE_EVENTS = {
  CTA_CLICK: 'CTA Click',
  SCROLL_50: 'Scroll 50%',
  SCROLL_75: 'Scroll 75%',
  SCROLL_100: 'Scroll 100%',
  EXIT_INTENT: 'Exit Intent',
} as const;

export const AUTH_EVENTS = {
  SIGNUP_STARTED: 'Signup Started',
  SIGNUP_STEP: 'Signup Step',
  SIGNUP_COMPLETED: 'Signup Completed',
  SIGNUP_ABANDONED: 'Signup Abandoned',
  LOGIN_SUCCESS: 'Login Success',
  LOGIN_ERROR: 'Login Error',
  OAUTH_INITIATED: 'OAuth Initiated',
} as const;

export const DOC_EVENTS = {
  FIRST_INVOICE_CREATED: 'First Invoice Created',
  DOCUMENT_CREATED: 'Document Created',
  DOCUMENT_DOWNLOADED: 'Document Downloaded',
  DOCUMENT_SHARED: 'Document Shared',
} as const;

export const UPGRADE_EVENTS = {
  UPGRADE_BUTTON_CLICKED: 'Upgrade Button Clicked',
  PLAN_UPGRADED: 'Plan Upgraded',
  PRICING_PAGE_VIEWED: 'Pricing Page Viewed',
} as const;

type GoalEvent =
  | 'CTA Click'
  | 'Signup Completed'
  | 'First Invoice Created'
  | 'Plan Upgraded';

export const GOALS: GoalEvent[] = [
  'CTA Click',
  'Signup Completed',
  'First Invoice Created',
  'Plan Upgraded',
];