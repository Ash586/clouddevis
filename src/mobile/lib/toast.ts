// CloudDevis Mobile — lightweight toast helper
// Native (Capacitor) → OS toast. Web → a visible DOM toast (NOT just a
// console log, so feedback is visible when the app runs in a browser).

export async function notify(message: string): Promise<void> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Toast } = await import('@capacitor/toast');
      await Toast.show({ text: message, duration: 'short' });
      return;
    }
  } catch {
    // fall through to the DOM toast
  }
  showDomToast(message);
}

function showDomToast(message: string): void {
  if (typeof document === 'undefined') return;
  let host = document.getElementById('cd-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'cd-toast-host';
    host.style.cssText =
      'position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom,0px));' +
      'transform:translateX(-50%);z-index:2147483647;display:flex;flex-direction:column;' +
      'gap:8px;align-items:center;pointer-events:none';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText =
    'max-width:88vw;background:#0F2747;color:#fff;font-size:13px;font-weight:500;' +
    'padding:10px 16px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.18);' +
    'opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;text-align:center';
  host.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 250);
  }, 2400);
}
