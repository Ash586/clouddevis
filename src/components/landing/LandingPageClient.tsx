'use client';

import { useState, useEffect } from 'react';
import { track, PAGE_EVENTS } from '@/lib/analytics';

export function LandingAnimations({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const maxDepth = { value: 0 };
    const milestones = new Set<number>();
    const scrollHandler = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((window.scrollY / docHeight) * 100);
      if (pct > maxDepth.value) maxDepth.value = pct;
      [25, 50, 75, 100].forEach((m) => {
        if (maxDepth.value >= m && !milestones.has(m)) {
          milestones.add(m);
          track('Scroll Depth', { percentage: m });
        }
      });
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    let exitFired = false;
    const exitHandler = (e: MouseEvent) => {
      if (exitFired) return;
      if (e.clientY <= 0) {
        exitFired = true;
        track(PAGE_EVENTS.EXIT_INTENT);
      }
    };
    document.addEventListener('mouseleave', exitHandler);

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
          }, i * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(16px)';
      (el as HTMLElement).style.transition = 'opacity .6s ease, transform .6s ease';
      obs.observe(el);
    });

    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', scrollHandler);
      document.removeEventListener('mouseleave', exitHandler);
    };
  }, []);

  return <>{children}</>;
}

export function LandingFAQ({ items }: { items: { q: string; a: string }[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="faq-grid">
      {items.map((item, i) => (
        <div key={i} className="faq-item animate-on-scroll">
          <button type="button"             onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="faq-q"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            {item.q}
          </button>
          {openFaq === i && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

export function LangSwitcher() {
  const [activeLang, setActiveLang] = useState('FR');

  return (
    <div className="footer-langs">
      {['FR', 'عر', 'EN'].map(l => (
        <button type="button" key={l} className={`lang-btn ${activeLang === l ? 'active' : ''}`} onClick={() => setActiveLang(l)}>
          {l}
        </button>
      ))}
    </div>
  );
}
