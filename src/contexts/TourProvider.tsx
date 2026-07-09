'use client';

import 'driver.js/dist/driver.css';
import '@/lib/tour/tour.css';
import { driver } from 'driver.js';
import { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { TOURS, type TourId } from '@/lib/tour/tours';

function doneKey(id: TourId) {
  return `rakmana-tour-${id}-done`;
}

export function isTourDone(id: TourId): boolean {
  try {
    return localStorage.getItem(doneKey(id)) === '1';
  } catch {
    return false;
  }
}

interface TourCtx {
  startTour: (id: TourId) => void;
}

const Ctx = createContext<TourCtx>({ startTour: () => {} });

export function useTour() {
  return useContext(Ctx);
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('tour');
  const locale = useLocale();

  const startTour = useCallback((id: TourId) => {
    // Only include steps whose anchor is currently in the DOM.
    const steps = TOURS[id].filter((s) => document.querySelector(s.el));
    if (steps.length === 0) return;

    const markDone = () => {
      try {
        localStorage.setItem(doneKey(id), '1');
      } catch {
        /* localStorage unavailable — tour simply re-offers next time */
      }
    };

    const d = driver({
      showProgress: true,
      allowClose: true,
      smoothScroll: true,
      stagePadding: 6,
      stageRadius: 10,
      overlayColor: 'rgba(11,23,42,0.55)',
      popoverClass: `rakmana-tour ${locale === 'ar' ? 'rakmana-tour-rtl' : ''}`,
      progressText: '{{current}} / {{total}}',
      nextBtnText: t('next'),
      prevBtnText: t('prev'),
      doneBtnText: t('done'),
      steps: steps.map((s) => ({
        element: s.el,
        popover: {
          title: t(s.titleKey),
          description: t(s.bodyKey),
          side: s.side ?? 'bottom',
          align: s.align ?? 'start',
        },
      })),
      // Fires on any termination (Done, close button, ESC, overlay click).
      // We override the default destroy, so we must call destroy() ourselves.
      onDestroyStarted: () => {
        markDone();
        d.destroy();
      },
    });

    d.drive();
  }, [t, locale]);

  return <Ctx.Provider value={{ startTour }}>{children}</Ctx.Provider>;
}

/**
 * Auto-start a tour once for a new user. `enabled` should encode the
 * "genuinely new / empty" condition (e.g. zero documents) so returning users
 * who cleared storage aren't re-onboarded. Runs at most once per mount and
 * never if the tour was already completed/dismissed.
 */
export function useAutoTour(id: TourId, enabled: boolean) {
  const { startTour } = useTour();
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current || isTourDone(id)) return;
    started.current = true;
    // Let the page finish its first paint/layout before spotlighting.
    const timer = setTimeout(() => startTour(id), 900);
    return () => clearTimeout(timer);
  }, [enabled, id, startTour]);
}
