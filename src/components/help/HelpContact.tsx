import type { HelpLang } from '@/lib/helpTranslations';
import { hT } from '@/lib/helpTranslations';

interface Props {
  lang: HelpLang;
}

export function HelpContact({ lang }: Props) {
  const t = (key: string) => hT(lang, key);

  return (
    <div className="rounded-xl p-6 text-center" id="contact" style={{ background: 'var(--navy-2)', border: '0.5px solid rgba(15,39,71,0.08)' }}>
      <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-[18px]" style={{ background: 'var(--navy-3)' }}>
        💬
      </div>
      <h3 className="text-[14px] font-bold mb-1" style={{ color: 'var(--sand)' }}>{t('contactTitle')}</h3>
      <p className="text-[12px] mb-4 max-w-md mx-auto" style={{ color: 'var(--sand-muted)' }}>
        {t('contactDesc')}
      </p>
      <div className="flex items-center justify-center gap-3">
        <a
          href="mailto:support@clouddevis.com"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition hover:opacity-90"
          style={{ background: 'var(--green-2)', color: 'white' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          {t('emailUs')}
        </a>
      </div>
    </div>
  );
}
