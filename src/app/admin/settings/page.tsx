'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Save, RefreshCw } from 'lucide-react';
import { TRIAL_DAYS } from '@/lib/subscription';

export default function AdminSettingsPage() {
  const t = useTranslations('admin');

  const [settings, setSettings] = useState({
    siteName: 'CloudDevIs',
    adminEmail: 'admin@clouddevis.com',
    defaultSubscription: '30',
    sessionTimeout: '60',
    maintenance: false,
    registrationOpen: true,
    trialDays: String(TRIAL_DAYS),
    maxDocsPerUser: '100',
    maxClientsPerUser: '50',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#a1a5ad', display: 'block', marginBottom: 6 };
  const inputStyle: React.CSSProperties = { background: '#282c38', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '9px 12px', fontSize: 13, color: '#e8ebf0', outline: 'none', width: '100%', boxSizing: 'border-box' };
  const cardStyle: React.CSSProperties = { background: '#14171e', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20 };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8ebf0', marginBottom: 20 }}>{t('nav.settings')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8ebf0', margin: '0 0 16px' }}>{t('settings.general')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('settings.siteName')}</label>
              <input type="text" value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('settings.adminEmail')}</label>
              <input type="email" value={settings.adminEmail} onChange={e => setSettings({ ...settings, adminEmail: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('settings.sessionTimeout')} (min)</label>
              <input type="number" value={settings.sessionTimeout} onChange={e => setSettings({ ...settings, sessionTimeout: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('settings.defaultSubscription')}</label>
              <select value={settings.defaultSubscription} onChange={e => setSettings({ ...settings, defaultSubscription: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">365 days</option>
              </select>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8ebf0', margin: '0 0 16px' }}>{t('settings.limits')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('settings.trialDays')}</label>
              <input type="number" value={settings.trialDays} onChange={e => setSettings({ ...settings, trialDays: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('settings.maxDocsPerUser')}</label>
              <input type="number" value={settings.maxDocsPerUser} onChange={e => setSettings({ ...settings, maxDocsPerUser: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('settings.maxClientsPerUser')}</label>
              <input type="number" value={settings.maxClientsPerUser} onChange={e => setSettings({ ...settings, maxClientsPerUser: e.target.value })} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e8ebf0', margin: '0 0 16px' }}>{t('settings.featuresStatus')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 13, color: '#e8ebf0' }}>
              <input type="checkbox" checked={settings.maintenance} onChange={e => setSettings({ ...settings, maintenance: e.target.checked })}
                style={{ accentColor: '#e8ebf0', width: 16, height: 16 }} />
              {t('settings.maintenanceMode')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 13, color: '#e8ebf0' }}>
              <input type="checkbox" checked={settings.registrationOpen} onChange={e => setSettings({ ...settings, registrationOpen: e.target.checked })}
                style={{ accentColor: '#e8ebf0', width: 16, height: 16 }} />
              {t('settings.registrationOpen')}
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 6,
              fontSize: 13, fontWeight: 700, border: '0.5px solid rgba(255,255,255,0.08)',
              cursor: saving ? 'default' : 'pointer',
              background: saved ? 'rgba(74,222,128,0.10)' : '#1d202a',
              color: saved ? '#4ade80' : '#e8ebf0',
              opacity: saving ? 0.5 : 1,
            }}>
            {saving ? (
              <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : saved ? (
              <Save size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? t('settings.saving') : saved ? t('settings.saved') : t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
