'use client';

export interface PushToastData {
  id: string;
  title: string;
  body: string;
  documentId?: string;
}

interface PushToastProps {
  toast: PushToastData | null;
  onDismiss: () => void;
  onTap?: (documentId: string) => void;
}

export function PushToast({ toast, onDismiss, onTap }: PushToastProps) {
  if (!toast) return null;

  return (
    <div
      className="fixed inset-x-0 top-3 z-[90] mx-auto max-w-sm px-3"
      style={{ paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}
    >
      <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white px-3.5 py-2.5 shadow-xl animate-in slide-in-from-top-5 fade-in duration-300">
        <div className="flex items-start gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0052CC]/8 text-[#0052CC]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#001A4D]">{toast.title}</p>
            <p className="text-[10px] text-[#718096] mt-0.5 truncate">{toast.body}</p>
          </div>
          <button onClick={onDismiss} aria-label="Fermer" className="text-[#718096] hover:text-[#0052CC] text-[10px] transition-colors duration-150">✕</button>
        </div>
      </div>
    </div>
  );
}
