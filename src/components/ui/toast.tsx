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
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {}, showNetworkError: () => {}, showValidationError: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const showNetworkError = useCallback(() => {
    showToast('Problème de connexion. Vérifiez votre réseau et réessayez.', 'network');
  }, [showToast]);

  const showValidationError = useCallback((field?: string) => {
    showToast(field ? `Champ invalide : ${field}` : 'Veuillez vérifier les champs obligatoires.', 'warning');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showNetworkError, showValidationError }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={cn(
            'pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border animate-slide-up',
            toast.type === 'success' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
            toast.type === 'error' && 'bg-red-50 text-red-700 border-red-200',
            toast.type === 'info' && 'bg-blue-50 text-blue-700 border-blue-200',
            toast.type === 'warning' && 'bg-amber-50 text-amber-700 border-amber-200',
            toast.type === 'network' && 'bg-orange-50 text-orange-700 border-orange-200',
          )}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
