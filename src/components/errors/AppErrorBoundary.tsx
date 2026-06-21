'use client';

import { GlobalErrorBoundary } from './GlobalErrorBoundary';

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary component="dashboard" severity="high" userImpact="blocking">
      {children}
    </GlobalErrorBoundary>
  );
}
