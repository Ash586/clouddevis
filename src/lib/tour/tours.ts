/**
 * Product-tour step definitions. Each step points at a stable DOM anchor
 * (a `[data-tour="…"]` attribute or an existing stable id/attr) and carries
 * i18n keys resolved from the `tour` namespace at run time. Steps whose anchor
 * is not present in the DOM are skipped automatically (see TourProvider), so a
 * conditional element (e.g. the draft card) never breaks the flow.
 */
export type TourId = 'dashboard' | 'editor';

export interface TourStep {
  el: string;
  titleKey: string;
  bodyKey: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export const TOURS: Record<TourId, TourStep[]> = {
  dashboard: [
    { el: '[data-tour="quick-create-grid"]', titleKey: 'dash.create.title', bodyKey: 'dash.create.body', side: 'top', align: 'start' },
    { el: '[data-tour="kpi-row"]',           titleKey: 'dash.kpi.title',    bodyKey: 'dash.kpi.body',    side: 'bottom', align: 'center' },
    { el: '[data-tour="section-tabs"]',      titleKey: 'dash.tabs.title',   bodyKey: 'dash.tabs.body',   side: 'bottom', align: 'start' },
    { el: '[data-tour="notif-bell"]',        titleKey: 'dash.notif.title',  bodyKey: 'dash.notif.body',  side: 'bottom', align: 'end' },
    { el: '[data-tour="user-pill"]',         titleKey: 'dash.account.title', bodyKey: 'dash.account.body', side: 'bottom', align: 'end' },
  ],
  editor: [
    { el: '[data-tour="doc-type"]',          titleKey: 'ed.type.title',   bodyKey: 'ed.type.body',   side: 'bottom', align: 'start' },
    { el: '[data-tour="section-nav"]',       titleKey: 'ed.nav.title',    bodyKey: 'ed.nav.body',    side: 'right', align: 'start' },
    { el: '[data-section-id="prestations"]', titleKey: 'ed.items.title',  bodyKey: 'ed.items.body',  side: 'right', align: 'start' },
    { el: '[data-tour="totals-bar"]',        titleKey: 'ed.totals.title', bodyKey: 'ed.totals.body', side: 'top', align: 'end' },
    { el: '#preview-scroll',                 titleKey: 'ed.preview.title', bodyKey: 'ed.preview.body', side: 'left', align: 'center' },
    { el: '[data-tour="save-btn"]',          titleKey: 'ed.save.title',   bodyKey: 'ed.save.body',   side: 'bottom', align: 'end' },
    { el: '[data-tour="download-pdf-btn"]',  titleKey: 'ed.pdf.title',    bodyKey: 'ed.pdf.body',    side: 'bottom', align: 'end' },
  ],
};

/** Map a pathname to the tour that applies to it, or null if none. */
export function tourIdForPath(pathname: string): TourId | null {
  if (pathname.startsWith('/dashboard/editor')) return 'editor';
  if (pathname === '/dashboard') return 'dashboard';
  return null;
}
