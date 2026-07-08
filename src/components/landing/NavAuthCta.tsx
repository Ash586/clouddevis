'use client';

// ============================================================
// Rakmana — Landing nav CTA (auth-aware)
// Anonymous visitors see "Se connecter" + "Commencer gratuitement".
// A logged-in visitor who lands on the marketing page instead sees a
// single "Accéder à mon tableau de bord" button — no reason to invite
// them to sign up again. Kept client-side so the page stays static;
// the anonymous buttons are the default so the common case has no flash.
// ============================================================

import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export function NavAuthCta() {
  const { user, loading } = useUser();

  if (!loading && user) {
    return (
      <div className="nav-cta">
        <Link href="/dashboard" className="btn btn-primary">
          Accéder à mon tableau de bord →
        </Link>
      </div>
    );
  }

  return (
    <div className="nav-cta">
      <Link href="/auth/login" className="btn btn-ghost">Se connecter à mon tableau de bord</Link>
      <Link
        href="/auth/register"
        className="btn btn-primary"
        data-plausible="CTA Click"
        data-event-location="nav"
        data-event-label="Commencer gratuitement"
      >
        Commencer gratuitement
      </Link>
    </div>
  );
}
