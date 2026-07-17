'use client';

// ============================================================
// Rakmana Mobile — Company Profile Screen
// Displays and edits company info: name, NIF, RC, NIS, AI, logo
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, ChevronDown, Image as ImageIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/companyStore';
import { useClientStore } from '@/stores/clientStore';
import { useUserStore } from '@/stores/userStore';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/mobile/lib/toast';
import { compressImageFile } from '@/mobile/lib/image';
import type { UserMode } from '@/mobile/types';

interface FieldDef { label: string; field: string; placeholder: string; type?: string }
interface FieldSection { id: string; title: string; fields: FieldDef[] }

/**
 * Persona-aware sections (soft gating): an artisan sees an "individual"
 * identity, an 11-digit NIF, and the fiscal/bank sections marked optional —
 * nothing is removed, everything stays fillable.
 */
function getFieldSections(mode: UserMode): FieldSection[] {
  const artisan = mode === 'artisan';
  return [
    {
      id: 'identity', title: 'Identité',
      fields: [
        artisan
          ? { label: 'Nom complet ou enseigne', field: 'name', placeholder: 'Ex: Karim Plomberie' }
          : { label: 'Nom de la société', field: 'name', placeholder: 'Ex: Bâtiment Plus SARL' },
        { label: 'Activité (sous le nom)', field: 'activity', placeholder: artisan ? 'Ex: Plomberie · Chauffage' : 'Ex: Importation · Vente · SAV' },
        { label: 'Adresse', field: 'address', placeholder: '123 Rue Principale, Alger' },
        { label: 'Téléphone', field: 'phone', placeholder: '0555 12 34 56' },
        { label: 'Email', field: 'email', placeholder: 'contact@societe.dz' },
        { label: 'Fax', field: 'fax', placeholder: '023 59 82 17' },
      ],
    },
    {
      id: 'fiscal', title: artisan ? 'Identifiants fiscaux (optionnel)' : 'Identifiants fiscaux',
      fields: [
        artisan
          ? { label: 'NIF (11 chiffres)', field: 'nif', placeholder: '12345678901', type: 'nif' }
          : { label: 'NIF (15 chiffres)', field: 'nif', placeholder: '123456789012345', type: 'nif' },
        { label: 'RC', field: 'rc', placeholder: '16/00-123456 A' },
        { label: 'NIS (10 chiffres)', field: 'nis', placeholder: '1234567890' },
        { label: 'AI', field: 'ai', placeholder: '1234567890' },
        { label: 'Capital', field: 'capital', placeholder: 'Ex: 100 000 DA' },
      ],
    },
    {
      id: 'bank', title: artisan ? 'Coordonnées bancaires (optionnel)' : 'Coordonnées bancaires',
      fields: [
        { label: 'Banque (nom + agence)', field: 'bankName', placeholder: 'Ex: Société Générale Sidi Yahia' },
        { label: 'RIB', field: 'rib', placeholder: '021 00001 1130036271 09' },
        { label: 'CCP', field: 'ccp', placeholder: '007 99999 0000 391575 54' },
      ],
    },
  ];
}

interface CompanyProfileScreenProps {
  /** Navigate to clients list */
  onGoToClients?: () => void;
}

export function CompanyProfileScreen({ onGoToClients }: CompanyProfileScreenProps) {
  const clientCount = useClientStore((s) => s.clients.length);
  const company = useCompanyStore((s) => s.company);
  const isSetup = useCompanyStore((s) => s.isSetup);
  const setCompany = useCompanyStore((s) => s.setCompany);
  const setLogo = useCompanyStore((s) => s.setLogo);
  const validate = useCompanyStore((s) => s.validate);

  const userMode = useUserStore((s) => s.mode);
  const fieldSections = getFieldSections(userMode);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoData, setLogoData] = useState<string | undefined>(company?.logo);
  const [logoError, setLogoError] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ identity: true, fiscal: true, bank: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──
  const [form, setForm] = useState({
    name: company?.name || '',
    activity: company?.activity || '',
    nif: company?.nif || '',
    rc: company?.rc || '',
    nis: company?.nis || '',
    ai: company?.ai || '',
    phone: company?.phone || '',
    email: company?.email || '',
    fax: company?.fax || '',
    address: company?.address || '',
    capital: company?.capital || '',
    rib: company?.rib || '',
    ccp: company?.ccp || '',
    bankName: company?.bankName || '',
  });

  const handleSave = useCallback(() => {
    const result = setCompany({
      id: company?.id || crypto.randomUUID().slice(0, 9),
      ...form,
      logo: logoData,
      tvaRate: company?.tvaRate || 19,
    });

    if (result && !result.valid) {
      setErrors(result.errors);
      setOpenSections((prev) => {
        const next = { ...prev };
        for (const section of fieldSections) {
          if (section.fields.some((f) => result.errors[f.field])) next[section.id] = true;
        }
        return next;
      });
      void notify('Vérifiez les champs en rouge');
      return;
    }

    setErrors({});
    void notify('Société enregistrée ✓');
  }, [form, company, logoData, setCompany, fieldSections]);

  // ── Logo upload (base64, max 500 KB) ──
  const handleLogoPick = useCallback(() => {
    setLogoError('');
    fileInputRef.current?.click();
  }, []);

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-picking the same file
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setLogoError('Veuillez choisir une image.');
        return;
      }
      // Compress client-side (≤500 KB) instead of rejecting heavy photos —
      // artisans pick camera shots, not optimized PNGs.
      compressImageFile(file, 500)
        .then((dataUrl) => {
          setLogoData(dataUrl);
          // Persist immediately if the company already exists; otherwise it is
          // saved together with the form on "Enregistrer".
          if (isSetup) setLogo(dataUrl);
        })
        .catch(() => setLogoError('Lecture du fichier impossible.'));
    },
    [isSetup, setLogo],
  );

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
          <h1 className="text-xl font-bold text-[var(--sand)]">{userMode === 'artisan' ? 'Mon activité' : 'Société'}</h1>
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
        {(
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--navy-3)] flex items-center justify-center overflow-hidden">
                {(logoData || company?.logo) ? (
                  <img src={logoData || company?.logo} alt="Logo de la société" className="w-full h-full object-cover" />
                ) : (
                  <Building size={28} className="text-[var(--sand-muted)]" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleLogoPick}
                    className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl bg-[var(--navy-3)] text-[var(--sand-muted)] text-xs font-semibold active:scale-[0.97] transition-transform"
                  >
                    <ImageIcon size={14} />
                    {(logoData || company?.logo) ? 'Changer le logo' : 'Ajouter un logo'}
                  </button>
                  {logoError && <p className="text-[11px] text-red-400">{logoError}</p>}
                </div>
            </div>

            {/* Form fields — grouped into collapsible sections */}
            {fieldSections.map((section) => {
              const isOpen = openSections[section.id] ?? false;
              const errorCount = section.fields.filter((f) => errors[f.field]).length;
              return (
                <div key={section.id} className="rounded-2xl border border-[var(--border)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenSections((s) => ({ ...s, [section.id]: !isOpen }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[var(--navy-3)] active:bg-[var(--navy-4)] transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--sand)]">
                      {section.title}
                      {errorCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-400/15 text-red-400">
                          {errorCount}
                        </span>
                      )}
                    </span>
                    {isOpen
                      ? <ChevronDown size={18} className="text-[var(--sand-muted)]" />
                      : <ChevronRight size={18} className="text-[var(--sand-muted)] rtl:rotate-180" />}
                  </button>
                  {isOpen && (
                    <div className="p-3 flex flex-col gap-3">
                      {section.fields.map(({ label, field, placeholder }) => (
                        <div key={field}>
                          <label className="text-xs font-semibold text-[var(--sand-muted)] mb-1 block">{label}</label>
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
                                : 'border-[var(--border)] focus:border-[var(--green-2)]',
                            )}
                          />
                          {errors[field] && <p className="text-[11px] text-red-400 mt-1">{errors[field]}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Save button */}
            <button type="button" onClick={handleSave}
              className={cn(
                'w-full py-3.5 rounded-xl text-sm font-semibold',
                'bg-[var(--green-2)] text-white active:scale-[0.98] transition-transform',
              )}
            >
              Enregistrer
            </button>

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
                  <div className="w-10 h-10 rounded-xl bg-[var(--blue-bg)] flex items-center justify-center">
                    <Users size={18} className="text-[var(--green-3)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--sand)]">Gérer les clients</p>
                    <p className="text-[11px] text-[var(--sand-muted)]">
                      {clientCount} client{clientCount !== 1 ? 's' : ''} enregistré{clientCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--sand-muted)] rtl:rotate-180" />
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
