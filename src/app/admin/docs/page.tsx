'use client';

import { FileText, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

const card = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '18px 20px' };

const REPORTS = [
  {
    slug: 'handoff',
    title: 'Engineering Handoff',
    description: 'Architecture, auth, data model, API surface, DGI business logic, deployment, and known technical debt — the full onboarding reference.',
  },
  {
    slug: 'dashboard-architecture-2026',
    title: 'Dashboard Architecture — 2026',
    description: '2026 industry baseline for dashboard rendering, state management, UX, and performance — cross-referenced against a live audit of Rakmana today.',
  },
];

export default function AdminDocsPage() {
  const t = useTranslations('admin');

  return (
    <div style={{ padding: '24px 28px', maxWidth: 760 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e8ebf0', margin: '0 0 4px' }}>
        {t('nav.docs')}
      </h1>
      <p style={{ fontSize: 13, color: '#8a8f98', margin: '0 0 24px' }}>
        Internal engineering reports — self-contained, opens in a new tab.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {REPORTS.map((r) => (
          <a
            key={r.slug}
            href={`/api/admin/docs/${r.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(74,158,255,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <span style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(74,158,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} color="#4a9eff" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#e8ebf0' }}>{r.title}</span>
              <span style={{ display: 'block', fontSize: 12, color: '#8a8f98', marginTop: 2, lineHeight: 1.5 }}>{r.description}</span>
            </span>
            <ExternalLink size={15} color="#656a73" style={{ flexShrink: 0 }} />
          </a>
        ))}
      </div>
    </div>
  );
}
