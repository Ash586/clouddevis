'use client';

// ============================================================
// CloudDevis Mobile — Company Profile Screen
// Displays and edits company info: name, NIF, RC, NIS, AI, logo
// ============================================================

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, Pencil, Image, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/companyStore';
import { useClientStore } from '@/stores/clientStore';
import { Badge } from '@/components/ui/badge';

interface CompanyProfileScreenProps {
  /** Navigate to clients list */
  onGoToClients?: () => void;
}

export function CompanyProfileScreen({ onGoToClients }: CompanyProfileScreenProps) {
  const clientCount = useClientStore((s) => s.clients.length);
  const company = useCompanyStore((s) => s.company);
  const isSetup = useCompanyStore((s) => s.isSetup);
  const setCompany = useCompanyStore((s) => s.setCompany);
  const updateCompany = useCompanyStore((s) => s.updateCompany);
  const setLogo = useCompanyStore((s) => s.setLogo);
  const validate = useCompanyStore((s) => s.validate);

  const [isEditing, setIsEditing] = useState(!isSetup);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Form state ──
  const [form, setForm] = useState({
    name: company?.name || '',
    nif: company?.nif || '',
    rc: company?.rc || '',
    nis: company?.nis || '',
    ai: company?.ai || '',
    phone: company?.phone || '',
    address: company?.address || '',
    capital: company?.capital || '',
  });

  const handleSave = useCallback(() => {
    const result = setCompany({
      id: company?.id || crypto.randomUUID().slice(0, 9),
      ...form,
      tvaRate: company?.tvaRate || 19,
    });

    if (result && !result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setIsEditing(false);
  }, [form, company, setCompany]);

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Validation status ──
  const validation = isSetup ? validate() : null;
  const isValid = validation?.valid ?? false;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-[var(--sand)]">Société</h1>
          {isSetup && (
            <button type="button"               onClick={() => setIsEditing(!isEditing)}
              className="w-10 h-10 rounded-xl bg-[var(--navy-3)] flex items-center justify-center text-[var(--sand-muted)] active:scale-95 transition-transform"
            >
              {isEditing ? <X size={18} /> : <Pencil size={18} />}
            </button>
          )}
        </div>
        {isSetup && (
          <div className="flex items-center gap-2">
            <Badge variant={isValid ? 'success' : 'danger'}>
              {isValid ? '✓ Conforme DGI' : '⚠ Non conforme'}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {!isSetup && !isEditing ? (
          /* ── Empty state ── */
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--navy-3)] flex items-center justify-center mb-4">
              <Building size={28} className="text-[var(--sand-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--sand-muted)]">
              Aucune société configurée
            </p>
            <p className="text-xs text-[var(--sand-muted)] mt-1 text-center max-w-[200px] mb-4">
              Ajoutez les informations de votre entreprise pour générer des documents conformes
            </p>
            <button type="button"               onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[var(--green-2)] text-white text-sm font-semibold active:scale-[0.97] transition-transform"
            >
              Configurer ma société
            </button>
          </motion.div>
        ) : (
          /* ── Company form / display ── */
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--navy-3)] flex items-center justify-center overflow-hidden">
                {company?.logo ? (
                  <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building size={28} className="text-[var(--sand-muted)]" />
                )}
              </div>
              {isEditing && (
                <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--navy-3)] text-[var(--sand-muted)] text-xs font-semibold active:scale-[0.97] transition-transform">
                  <Image size={14} />
                  Ajouter un logo
                </button>
              )}
            </div>

            {/* Form fields */}
            {[
              { label: 'Nom de la société', field: 'name', placeholder: 'Ex: Bâtiment Plus SARL' },
              { label: 'NIF (15 chiffres)', field: 'nif', placeholder: '123456789012345', type: 'nif' },
              { label: 'RC', field: 'rc', placeholder: '16/00-123456 A' },
              { label: 'NIS (10 chiffres)', field: 'nis', placeholder: '1234567890' },
              { label: 'AI', field: 'ai', placeholder: '1234567890' },
              { label: 'Téléphone', field: 'phone', placeholder: '0555 12 34 56' },
              { label: 'Adresse', field: 'address', placeholder: '123 Rue Principale, Alger' },
              { label: 'Capital', field: 'capital', placeholder: 'Ex: 100,000 DA' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">
                  {label}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form[field as keyof typeof form]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl text-sm',
                      'bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                      'border transition-colors',
                      errors[field]
                        ? 'border-red-400/50 focus:border-red-400'
                        : 'border-[var(--border)] focus:border-[rgba(37,99,235,0.3)]',
                    )}
                  />
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-[var(--navy-3)] text-sm text-[var(--sand)]">
                    {company?.[field as keyof typeof company] || '—'}
                  </div>
                )}
                {errors[field] && (
                  <p className="text-[11px] text-red-400 mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            {/* Save button */}
            {isEditing && (
              <button type="button"                 onClick={handleSave}
                className={cn(
                  'w-full py-3.5 rounded-xl text-sm font-semibold',
                  'bg-[var(--green-2)] text-white active:scale-[0.98] transition-transform',
                )}
              >
                Enregistrer
              </button>
            )}

            {/* Clients navigation */}
            {isSetup && onGoToClients && (
              <button type="button"                 onClick={onGoToClients}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-xl',
                  'bg-[var(--navy-2)] border border-[var(--border)]',
                  'active:scale-[0.98] transition-transform',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center">
                    <Users size={18} className="text-[#1D4ED8]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--sand)]">Gérer les clients</p>
                    <p className="text-[11px] text-[var(--sand-muted)]">
                      {clientCount} client{clientCount !== 1 ? 's' : ''} enregistré{clientCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--sand-muted)]" />
              </button>
            )}

            {/* Validation details */}
            {isSetup && validation && !validation.valid && (
              <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10">
                <p className="text-xs font-semibold text-red-400 mb-2">Erreurs de validation :</p>
                {Object.entries(validation.errors).map(([key, msg]) => (
                  <p key={key} className="text-[11px] text-red-400/80">
                    • {msg}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
