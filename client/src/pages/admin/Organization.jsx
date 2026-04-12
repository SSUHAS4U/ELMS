import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const FIELD_TYPES = {
  string: 'text',
  number: 'number',
  boolean: 'checkbox',
};

const GROUP_LABELS = {
  company: '🏢 Company Info',
  leave_policy: '📋 Leave Policy',
  working_days: '🕐 Working Hours',
};

const Organization = () => {
  const [settings, setSettings] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/org/settings');
      if (res.data.settings.length === 0) {
        // Seed defaults first
        await api.post('/org/settings/seed');
        const res2 = await api.get('/org/settings');
        setSettings(res2.data.settings);
        setValues(res2.data.map);
      } else {
        setSettings(res.data.settings);
        setValues(res.data.map);
      }
    } catch (error) {
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key, value, type) => {
    setValues(v => ({ ...v, [key]: type === 'number' ? Number(value) : type === 'boolean' ? value : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
      await api.put('/org/settings', { settings: payload });
      toast.success('Organization settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Group settings
  const grouped = settings.reduce((acc, s) => {
    const g = s.group || 'other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Organization Settings</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">System-wide configuration — all values stored in the database</p>
        </div>
        <button onClick={handleSave} disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-xl hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm text-sm disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, fields], gi) => (
            <motion.div key={group} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }}
              className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-[color:var(--border-subtle)] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[color:var(--accent-primary)]" />
                <h2 className="font-bold text-[color:var(--text-primary)] text-sm">{GROUP_LABELS[group] || group}</h2>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">{field.label}</label>
                    {field.type === 'boolean' ? (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" checked={!!values[field.key]}
                            onChange={e => handleChange(field.key, e.target.checked, 'boolean')}
                            className="sr-only" />
                          <div className={`w-11 h-6 rounded-full transition-colors ${values[field.key] ? 'bg-[color:var(--accent-primary)]' : 'bg-[color:var(--border-subtle)]'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${values[field.key] ? 'translate-x-5' : ''}`} />
                          </div>
                        </div>
                        <span className="text-sm text-[color:var(--text-primary)]">{values[field.key] ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    ) : (
                      <input
                        type={FIELD_TYPES[field.type] || 'text'}
                        value={values[field.key] ?? ''}
                        onChange={e => handleChange(field.key, e.target.value, field.type)}
                        className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)] transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organization;
