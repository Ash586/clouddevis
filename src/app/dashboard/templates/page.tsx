'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

interface Template {
  id: string;
  name: string;
  description: string | null;
  documentType: string;
  mode: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'DEVIS', label: 'Devis' },
  { value: 'FACTURE', label: 'Facture' },
  { value: 'PROFORMA', label: 'Proforma' },
  { value: 'BC', label: 'Bon de Commande' },
  { value: 'BR', label: 'Bon de Réception' },
  { value: 'INTERVENTION', label: 'Intervention' },
  { value: 'ATTACHEMENT', label: 'Attachement' },
];

const MODE_OPTIONS = [
  { value: 'ARTISAN', label: 'Artisan' },
  { value: 'ENTREPRISE', label: 'Entreprise' },
];

const TYPE_BADGE_VARIANT: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  DEVIS: 'info',
  FACTURE: 'success',
  PROFORMA: 'warning',
  BC: 'default',
  BR: 'danger',
  INTERVENTION: 'warning',
  ATTACHEMENT: 'info',
};

const TYPE_LABEL: Record<string, string> = {
  DEVIS: 'Devis',
  FACTURE: 'Facture',
  PROFORMA: 'Proforma',
  BC: 'Bon de Commande',
  BR: 'Bon de Réception',
  INTERVENTION: 'Intervention',
  ATTACHEMENT: 'Attachement',
};

export default function TemplatesPage() {
  const t = useTranslations('templates');
  const tc = useTranslations('common');
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState('DEVIS');
  const [formMode, setFormMode] = useState('ARTISAN');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTemplates = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    fetch(`/api/templates?${params}`)
      .then(r => r.ok ? r.json() : { templates: [] })
      .then(d => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(timer);
  }, [fetchTemplates]);

  function openCreate() {
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setFormType('DEVIS');
    setFormMode('ARTISAN');
    setShowForm(true);
  }

  function openEdit(tpl: Template) {
    setEditingId(tpl.id);
    setFormName(tpl.name);
    setFormDescription(tpl.description ?? '');
    setFormType(tpl.documentType);
    setFormMode(tpl.mode);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/templates/${editingId}` : '/api/templates';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim() || null,
          documentType: formType,
          mode: formMode,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchTemplates();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchTemplates();
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleUseTemplate(id: string) {
    router.push(`/dashboard/editor?template=${id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 min-w-0">
          <TrialGate>
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--sand)]">{t('title')}</h1>
                <Button onClick={openCreate}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {t('newTemplate')}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder={tc('search')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select
                    options={TYPE_OPTIONS}
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <div className="space-y-3">
                        <div className="h-4 bg-[var(--navy-3)] rounded w-2/3" />
                        <div className="h-3 bg-[var(--navy-4)] rounded w-full" />
                        <div className="h-3 bg-[var(--navy-4)] rounded w-1/2" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-[var(--sand-muted)] text-sm mb-4">{t('empty')}</p>
                  <Button onClick={openCreate}>{t('createFirst')}</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(tpl => (
                    <Card key={tpl.id} className="flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-[var(--sand)] truncate">{tpl.name}</h3>
                        <Badge variant={TYPE_BADGE_VARIANT[tpl.documentType] ?? 'default'}>
                          {TYPE_LABEL[tpl.documentType] ?? tpl.documentType}
                        </Badge>
                      </div>
                      {tpl.description && (
                        <p className="text-xs text-[var(--sand-muted)] mb-3 line-clamp-2">{tpl.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[var(--sand-muted)] mb-4">
                        <span>{tpl.itemCount} {tc('type').toLowerCase() === 'type' ? 'éléments' : 'items'}</span>
                        <span>·</span>
                        <span>{tpl.createdAt}</span>
                        <span>·</span>
                        <span className="capitalize">{tpl.mode.toLowerCase()}</span>
                      </div>
                      <div className="mt-auto flex items-center gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleUseTemplate(tpl.id)}>
                          {t('use')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(tpl)}>
                          {t('edit')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(tpl.id)}>
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TrialGate>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? t('editTemplate') : t('newTemplate')}>
        <div className="space-y-4 text-left">
          <Input
            label={t('nameLabel')}
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder={t('namePlaceholder')}
          />
          <Input
            label={t('descriptionLabel')}
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
          />
          <Select
            label={t('documentTypeLabel')}
            options={TYPE_OPTIONS.filter(o => o.value)}
            value={formType}
            onChange={e => setFormType(e.target.value)}
          />
          <Select
            label={t('modeLabel')}
            options={MODE_OPTIONS}
            value={formMode}
            onChange={e => setFormMode(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>{tc('cancel')}</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving ? tc('loading') : tc('save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title={t('deleteTitle')}>
        <div className="space-y-4">
          <p className="text-sm text-[var(--sand-muted)]">{t('deleteConfirm')}</p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>{tc('cancel')}</Button>
            <Button variant="secondary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
              {deleting ? tc('loading') : tc('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
