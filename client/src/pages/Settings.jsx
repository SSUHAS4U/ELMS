import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Lock, Shield, ArrowRight } from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
import useThemeStore from '../hooks/useThemeStore';
import api from '../lib/api';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success('Password updated successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[color:var(--border-subtle)]">
            <Shield className="w-5 h-5 text-[color:var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[color:var(--text-secondary)] block mb-1">Full Name</label>
              <div className="text-sm text-[color:var(--text-primary)] font-medium bg-[color:var(--bg-overlay)] p-3 rounded-lg border border-[color:var(--border-subtle)]">{user?.name}</div>
            </div>
            <div>
              <label className="text-xs text-[color:var(--text-secondary)] block mb-1">Email / Username</label>
              <div className="text-sm text-[color:var(--text-primary)] font-medium bg-[color:var(--bg-overlay)] p-3 rounded-lg border border-[color:var(--border-subtle)]">{user?.email} {user?.username ? `(@${user.username})` : ''}</div>
            </div>
            <div>
              <label className="text-xs text-[color:var(--text-secondary)] block mb-1">Role Configuration</label>
              <div className="text-sm text-[color:var(--text-primary)] font-medium capitalize bg-[color:var(--bg-overlay)] p-3 rounded-lg border border-[color:var(--border-subtle)]">{user?.role} {user?.employeeId ? `· ID: ${user.employeeId}` : ''}</div>
            </div>
          </div>
        </motion.div>

        {/* Theme Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[color:var(--border-subtle)]">
            <Monitor className="w-5 h-5 text-[color:var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Interface Theme</h2>
          </div>
          <div className="space-y-3">
            {[
              { id: 'dark', name: 'Dark Mode', icon: Moon },
              { id: 'light', name: 'Light Mode', icon: Sun },
              { id: 'system', name: 'System Default', icon: Monitor }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${theme === t.id ? 'bg-[color:var(--accent-glow)] border-[color:var(--accent-primary)]' : 'bg-[color:var(--bg-base)] border-[color:var(--border-subtle)] hover:border-[color:var(--text-secondary)]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${theme === t.id ? 'text-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`} />
                    <span className={`text-sm font-medium ${theme === t.id ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)]'}`}>{t.name}</span>
                  </div>
                  {theme === t.id && <div className="w-2 h-2 rounded-full bg-[color:var(--accent-primary)] shadow-[0_0_8px_rgba(0,255,135,0.8)]" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Password Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[color:var(--border-subtle)]">
            <Lock className="w-5 h-5 text-[color:var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[color:var(--text-secondary)] block mb-1">Current Password</label>
                <input required type="password" value={passForm.currentPassword} onChange={e => setPassForm(p => ({...p, currentPassword: e.target.value}))}
                  className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[color:var(--text-secondary)] block mb-1">New Password</label>
                <input required type="password" value={passForm.newPassword} onChange={e => setPassForm(p => ({...p, newPassword: e.target.value}))}
                  className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
              </div>
              <div>
                <label className="text-xs text-[color:var(--text-secondary)] block mb-1">Confirm New Password</label>
                <input required type="password" value={passForm.confirmPassword} onChange={e => setPassForm(p => ({...p, confirmPassword: e.target.value}))}
                  className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
              </div>
            </div>
            <div>
              <button disabled={loading} type="submit" 
                className="w-full py-2.5 bg-[color:var(--accent-primary)] text-black font-bold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors text-sm flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>Update Password <ArrowRight className="w-4 h-4"/></>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
