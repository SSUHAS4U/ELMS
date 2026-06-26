import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Lock, UserCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
import useThemeStore from '../hooks/useThemeStore';
import api from '../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, Button } from '../components/ui';

const field = 'w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors';

const Settings = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('New passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password updated successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <div>
      <label className="text-xs text-content-secondary block mb-1.5">{label}</label>
      <div className="text-sm text-content font-medium bg-overlay p-3 rounded-[var(--radius-sm)] border border-line">{value}</div>
    </div>
  );

  const themes = [
    { id: 'dark', name: 'Dark Mode', icon: Moon },
    { id: 'light', name: 'Light Mode', icon: Sun },
    { id: 'system', name: 'System Default', icon: Monitor },
  ];

  return (
    <div className="space-y-6 pb-12 w-full max-w-4xl mx-auto">
      <PageHeader eyebrow="Account" title="Settings" icon={UserCircle} subtitle="Manage your account preferences and security." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-6">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-line/60">
            <UserCircle className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-content">Profile information</h2>
          </div>
          <div className="space-y-4">
            <InfoRow label="Full name" value={user?.name} />
            <InfoRow label="Email / Username" value={`${user?.email} ${user?.username ? `(@${user.username})` : ''}`} />
            <InfoRow label="Role configuration" value={<span className="capitalize">{user?.role} {user?.employeeId ? `· ID: ${user.employeeId}` : ''}</span>} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-panel p-6">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-line/60">
            <Monitor className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-content">Interface theme</h2>
          </div>
          <div className="space-y-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = theme === t.id;
              return (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-[var(--radius)] border transition-all ${active ? 'bg-[color:var(--accent-glow)] border-accent ring-1 ring-inset ring-accent/20' : 'bg-base border-line hover:border-content-tertiary'}`}>
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-content-secondary'}`} />
                    <span className={`text-sm font-medium ${active ? 'text-content' : 'text-content-secondary'}`}>{t.name}</span>
                  </span>
                  {active && <span className="w-2 h-2 rounded-full bg-accent shadow-glow" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass-panel p-6 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-line/60">
            <Lock className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-content">Change password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-4">
              <div><label className="text-xs text-content-secondary block mb-1.5">Current password</label><input required type="password" autoComplete="current-password" value={passForm.currentPassword} onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))} className={field} /></div>
              <div><label className="text-xs text-content-secondary block mb-1.5">New password</label><input required type="password" autoComplete="new-password" value={passForm.newPassword} onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))} className={field} /></div>
              <div><label className="text-xs text-content-secondary block mb-1.5">Confirm new password</label><input required type="password" autoComplete="new-password" value={passForm.confirmPassword} onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))} className={field} /></div>
            </div>
            <Button type="submit" loading={loading} className="w-full">{!loading && <>Update password <ArrowRight className="w-4 h-4" /></>}</Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
