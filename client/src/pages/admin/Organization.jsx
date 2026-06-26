import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Building, ClipboardList, Clock } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, Button, Skeleton } from '../../components/ui';

const FIELD_TYPES = { string: 'text', number: 'number', boolean: 'checkbox' };
const GROUP_META = {
  company: { label: 'Company Info', icon: Building },
  leave_policy: { label: 'Leave Policy', icon: ClipboardList },
  working_days: { label: 'Working Hours', icon: Clock },
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
        await api.post('/org/settings/seed');
        const res2 = await api.get('/org/settings');
        setSettings(res2.data.settings); setValues(res2.data.map);
      } else {
        setSettings(res.data.settings); setValues(res.data.map);
      }
    } catch {
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key, value, type) => setValues((v) => ({ ...v, [key]: type === 'number' ? Number(value) : value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
      await api.put('/org/settings', { settings: payload });
      toast.success('Organization settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const grouped = settings.reduce((acc, s) => { (acc[s.group || 'other'] = acc[s.group || 'other'] || []).push(s); return acc; }, {});

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Configuration" title="Organization Settings" icon={Settings} subtitle="System-wide configuration — all values stored in the database."
        actions={<Button onClick={handleSave} loading={saving} disabled={loading}>{!saving && <Save className="w-4 h-4" />} Save changes</Button>} />

      {loading ? (
        <div className="space-y-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, fields], gi) => {
            const meta = GROUP_META[group] || { label: group, icon: Settings };
            return (
              <motion.div key={group} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }} className="glass-panel overflow-hidden">
                <div className="px-5 py-3.5 border-b border-line/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[color:var(--accent-glow)] grid place-items-center text-accent"><meta.icon className="w-4 h-4" /></div>
                  <h2 className="font-display font-semibold text-content text-sm">{meta.label}</h2>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-medium text-content-secondary block mb-1.5">{field.label}</label>
                      {field.type === 'boolean' ? (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <span className="relative">
                            <input type="checkbox" checked={!!values[field.key]} onChange={(e) => handleChange(field.key, e.target.checked, 'boolean')} className="sr-only peer" />
                            <span className={`block w-11 h-6 rounded-full transition-colors ${values[field.key] ? 'bg-accent' : 'bg-line'}`} />
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${values[field.key] ? 'translate-x-5' : ''}`} />
                          </span>
                          <span className="text-sm text-content">{values[field.key] ? 'Enabled' : 'Disabled'}</span>
                        </label>
                      ) : (
                        <input type={FIELD_TYPES[field.type] || 'text'} value={values[field.key] ?? ''} onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                          className="w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Organization;
