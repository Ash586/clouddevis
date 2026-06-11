'use client';

import { useState, useEffect } from 'react';

export function LandingAnimations({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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

    return () => obs.disconnect();
  }, []);

  return <>{children}</>;
}

export function LandingFAQ({ items }: { items: { q: string; a: string }[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="faq-grid">
      {items.map((item, i) => (
        <div key={i} className="faq-item animate-on-scroll">
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
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
        <button key={l} className={`lang-btn ${activeLang === l ? 'active' : ''}`} onClick={() => setActiveLang(l)}>
          {l}
        </button>
      ))}
    </div>
  );
}
