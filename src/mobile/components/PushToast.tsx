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
      className="fixed inset-x-0 top-4 z-[90] mx-auto max-w-sm px-4"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white px-4 py-3 shadow-xl animate-in slide-in-from-top-5 fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#2563EB]">{toast.title}</p>
            <p className="text-xs text-[#33425C] mt-0.5 truncate">{toast.body}</p>
          </div>
          <button onClick={onDismiss} className="text-[#5A6B85] hover:text-[#2563EB] text-xs">âœ•</button>
        </div>
      </div>
    </div>
  );
}
