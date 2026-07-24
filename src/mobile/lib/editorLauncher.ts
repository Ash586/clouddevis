// ============================================================
// Rakmana Mobile — Editor Launcher
// Navigates the WebView to the website's full editor page.
// Session cookies are preserved (same origin).
// Back button returns to the mobile app via WebView history.
// ============================================================

/** Open the website editor for a new document or an existing one. */
export function openEditor(opts?: { type?: string; docId?: string }) {
  const params = new URLSearchParams();
  if (opts?.type) params.set('type', opts.type);
  if (opts?.docId) params.set('id', opts.docId);
  const qs = params.toString();
  // Navigate the WebView to the editor page (same origin, preserves session)
  window.location.href = `/dashboard/editor${qs ? `?${qs}` : ''}`;
}
