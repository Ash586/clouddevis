'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) router.push('/auth/login');
      })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  return <>{children}</>;
}
