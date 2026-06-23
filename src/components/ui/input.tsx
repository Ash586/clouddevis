'use client';
import { useState, useId } from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function Input({ label, error, className, id, type, showPasswordToggle, ...props }: Props) {
  const autoId = useId();
  const iid = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? autoId;
  const errId = `${iid}-error`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password' && showPasswordToggle;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={iid} className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={iid}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errId : undefined}
          autoComplete={type === 'email' ? 'email' : type === 'password' ? (props.autoComplete || 'current-password') : props.autoComplete}
          className={cn(
            'w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-2)] px-3.5 py-2.5 text-sm text-[var(--sand)]',
            'placeholder:text-[var(--sand-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)] focus-visible:border-[var(--green-2)]',
            'transition-all duration-200',
            isPassword && 'pr-12 rtl:pl-12 rtl:pr-3.5',
            error && 'border-red-400 focus-visible:ring-red-400/30 focus-visible:border-red-500',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-controls={iid}
            className="absolute right-1 rtl:right-auto rtl:left-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--sand-muted)] hover:text-[var(--sand)] transition rounded-xl hover:bg-[var(--navy-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)]"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errId} role="alert" className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
