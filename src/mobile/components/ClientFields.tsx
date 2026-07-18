'use client';

// ============================================================
// Rakmana Mobile — Grouped client form fields
// Shared by ClientsScreen (add/edit sheet) and CreateDock
// (inline client create). Three groups: essentials always
// visible, contact + fiscal collapsible. Fiscal fields get
// live DGI validation (warn-only, never blocks saving).
// ============================================================

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Mail, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateNIF, validateRC, validateNIS, validateAI } from '@/lib/dgi';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { hapticLight } from '@/mobile/lib/haptics';

export interface ClientFieldsState {
  name: string;
  phone: string;
  email: string;
  address: string;
  nif: string;
  rc: string;
  nis: string;
  ai: string;
}

export const EMPTY_CLIENT_FIELDS: ClientFieldsState = {
  name: '', phone: '', email: '', address: '', nif: '', rc: '', nis: '', ai: '',
};

const inputCls =
  'w-full px-3.5 py-3 rounded-xl text-sm bg-[var(--navy-3)] text-[var(--sand)] ' +
  'placeholder:text-[var(--sand-muted)] border focus:outline-none transition-colors';

// ── Single field with optional live validation ───────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  type?: string;
  validate?: (v: string) => boolean;
  invalidHint?: string;
  autoFocus?: boolean;
}

function Field({ label, value, onChange, placeholder, inputMode, type = 'text', validate, invalidHint, autoFocus }: FieldProps) {
  const trimmed = value.trim();
  const state: 'valid' | 'invalid' | null = validate && trimmed ? (validate(trimmed) ? 'valid' : 'invalid') : null;

  return (
    <div>
      <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">{label}</label>
      <div className="relative">
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            inputCls,
            state === 'invalid'
              ? 'border-red-400 focus:border-red-400'
              : 'border-[var(--border)] focus:border-[var(--green-2)]',
            state === 'valid' && 'pe-9',
          )}
        />
        {state === 'valid' && (
          <span className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={12} className="text-white" strokeWidth={3} />
          </span>
        )}
      </div>
      {state === 'invalid' && invalidHint && (
        <p className="text-[11px] text-red-400 mt-1">{invalidHint}</p>
      )}
    </div>
  );
}

// ── Collapsible group ────────────────────────────────────────
interface FieldGroupProps {
  icon: ReactNode;
  title: string;
  badge?: string;
  defaultOpen: boolean;
  children: ReactNode;
}

function FieldGroup({ icon, title, badge, defaultOpen, children }: FieldGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--navy-2)] overflow-hidden">
      <button
        type="button"
        onClick={() => { hapticLight(); setOpen((o) => !o); }}
        className="w-full flex items-center gap-2 px-3.5 min-h-[48px] active:bg-[var(--navy-3)] transition-colors"
      >
        <span className="text-[var(--sand-muted)]">{icon}</span>
        <span className="text-xs font-bold text-[var(--sand)]">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--green-bg)] text-[var(--green-3)]">
            {badge}
          </span>
        )}
        <ChevronDown size={16} className={cn('ms-auto text-[var(--sand-muted)] transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 flex flex-col gap-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Grouped client fields ────────────────────────────────────
interface ClientFieldsProps {
  form: ClientFieldsState;
  onChange: (patch: Partial<ClientFieldsState>) => void;
  /** Autofocus the name field (new-client flows). */
  autoFocusName?: boolean;
}

export function ClientFields({ form, onChange, autoFocusName }: ClientFieldsProps) {
  const { t } = useMobileI18n();

  const fiscalFilled = [form.nif, form.rc, form.nis, form.ai].filter((v) => v.trim()).length;
  const contactFilled = [form.email, form.address].some((v) => v.trim());

  return (
    <div className="flex flex-col gap-2.5">
      {/* Essentials — always visible */}
      <Field
        label={`${t('clients.name')} *`}
        value={form.name}
        onChange={(v) => onChange({ name: v })}
        placeholder={t('clients.namePh')}
        autoFocus={autoFocusName}
      />
      <Field
        label={t('clients.phone')}
        value={form.phone}
        onChange={(v) => onChange({ phone: v })}
        placeholder="0555 12 34 56"
        inputMode="tel"
        type="tel"
      />

      {/* Contact — collapsible */}
      <FieldGroup
        icon={<Mail size={15} />}
        title={t('clients.groupContact')}
        badge={contactFilled ? '✓' : undefined}
        defaultOpen={contactFilled}
      >
        <Field
          label={t('clients.email')}
          value={form.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="client@example.com"
          inputMode="email"
          type="email"
        />
        <Field
          label={t('clients.address')}
          value={form.address}
          onChange={(v) => onChange({ address: v })}
          placeholder={t('clients.addressPh')}
        />
      </FieldGroup>

      {/* Fiscal — collapsible, live-validated */}
      <FieldGroup
        icon={<Landmark size={15} />}
        title={t('clients.groupFiscal')}
        badge={fiscalFilled > 0 ? `${fiscalFilled}/4` : undefined}
        defaultOpen={fiscalFilled > 0}
      >
        <Field
          label="NIF"
          value={form.nif}
          onChange={(v) => onChange({ nif: v })}
          placeholder="000 000 000 000 000"
          inputMode="numeric"
          validate={validateNIF}
          invalidHint={t('clients.nifHint')}
        />
        <Field
          label="RC"
          value={form.rc}
          onChange={(v) => onChange({ rc: v })}
          placeholder="16B1234567"
          validate={validateRC}
          invalidHint={t('clients.rcHint')}
        />
        <Field
          label="NIS"
          value={form.nis}
          onChange={(v) => onChange({ nis: v })}
          placeholder="0000000000"
          inputMode="numeric"
          validate={validateNIS}
          invalidHint={t('clients.nisHint')}
        />
        <Field
          label="AI"
          value={form.ai}
          onChange={(v) => onChange({ ai: v })}
          placeholder="0000000000"
          inputMode="numeric"
          validate={validateAI}
          invalidHint={t('clients.aiHint')}
        />
      </FieldGroup>
    </div>
  );
}
