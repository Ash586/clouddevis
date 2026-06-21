'use client';

import { RouteError } from '@/components/errors/RouteError';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} resetError={reset} component="dashboard" severity="high" userImpact="blocking" />;
}
