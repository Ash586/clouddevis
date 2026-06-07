'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Bell, Mail, Database, Key, Save, Loader2 } from 'lucide-react';

interface AdminInfo {
  id: string; email: string; name: string; role: string; lastLogin: string;
}

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => setAdmin(d.admin))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Paramètres</h1>

      <Card className="p-5">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Profil administrateur</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Nom</span><span className="font-semibold">{admin?.name}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Email</span><span className="font-semibold">{admin?.email}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Rôle</span><span className="font-semibold">{admin?.role}</span></div>
          <div className="flex justify-between py-2"><span className="text-slate-500">Dernière connexion</span><span className="font-semibold">{admin?.lastLogin || 'N/A'}</span></div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><Key className="w-4 h-4" /> Sécurité</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div><p className="font-semibold text-sm">Authentification à deux facteurs (2FA)</p><p className="text-xs text-slate-500">Sécurisez votre compte avec Google Authenticator</p></div>
            <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100">Configurer</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="font-semibold text-sm">Notifications de sécurité</p><p className="text-xs text-slate-500">Alertes email sur connexion depuis une nouvelle IP</p></div>
            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /><span className="text-xs text-slate-500">Activé</span></div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h2>
        <div className="space-y-3">
          {['Nouvel utilisateur inscrit', 'Nouvel abonnement Pro', 'Erreur système critique', 'Demande de paiement partenaire'].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm">{n}</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
