'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={cn(
            'pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border animate-slide-up',
            toast.type === 'success' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
            toast.type === 'error' && 'bg-red-50 text-red-700 border-red-200',
            toast.type === 'info' && 'bg-blue-50 text-blue-700 border-blue-200',
          )}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
