'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'network';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
  showNetworkError: () => void;
  showValidationError: (field?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {}, showNetworkError: () => {}, showValidationError: () => {}, dismissToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const typeStyles: Record<Toast['type'], string> = {
  success: 'bg-[var(--green-bg)] text-[var(--green-3)] border-[rgba(0,149,77,0.25)]',
  error: 'bg-[rgba(232,84,46,0.1)] text-[var(--stamp-red)] border-[rgba(232,84,46,0.25)]',
  info: 'bg-[rgba(74,158,255,0.1)] text-[#4a9eff] border-[rgba(74,158,255,0.25)]',
  warning: 'bg-[rgba(245,158,11,0.1)] text-[var(--cd-warning)] border-[rgba(245,158,11,0.25)]',
  network: 'bg-[rgba(234,88,12,0.1)] text-[#ea580c] border-[rgba(234,88,12,0.25)]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showNetworkError = useCallback(() => {
    showToast('Problème de connexion. Vérifiez votre réseau et réessayez.', 'network');
  }, [showToast]);

  const showValidationError = useCallback((field?: string) => {
    showToast(field ? `Champ invalide : ${field}` : 'Veuillez vérifier les champs obligatoires.', 'warning');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showNetworkError, showValidationError, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 max-sm:right-2 max-sm:left-2 z-[200] space-y-2 pointer-events-none" aria-live="polite" aria-relevant="additions removals">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              'pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border animate-slide-up flex items-center gap-3 max-sm:w-full',
              typeStyles[toast.type]
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fermer"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
