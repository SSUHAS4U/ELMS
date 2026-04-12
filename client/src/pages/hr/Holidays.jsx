import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data.holidays || []);
    } catch {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.date) { toast.error('Name and date are required'); return; }
    setSaving(true);
    try {
      await api.post('/holidays', form);
      toast.success('Holiday added');
      setShowModal(false);
      setForm({ name: '', date: '', description: '' });
      fetchHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday removed');
      fetchHolidays();
    } catch {
      toast.error('Failed to remove holiday');
    } finally {
      setDeleting(null);
    }
  };

  // Group by month
  const grouped = holidays.reduce((acc, h) => {
    const month = new Date(h.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  const now = new Date();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Holiday Calendar</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">Manage organisation-wide holidays</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-xl hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm text-sm">
          <Plus className="w-4 h-4" /> Add Holiday
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-[color:var(--bg-surface)] border border-dashed border-[color:var(--border-subtle)] rounded-xl">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-[color:var(--text-secondary)] opacity-40" />
          <div className="text-[color:var(--text-secondary)]">No holidays configured yet</div>
          <button onClick={() => setShowModal(true)} className="mt-4 text-[color:var(--accent-primary)] font-semibold text-sm">Add the first holiday →</button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, list]) => (
            <div key={month}>
              <h2 className="text-sm font-bold text-[color:var(--text-secondary)] uppercase tracking-wider mb-3">{month}</h2>
              <div className="space-y-2">
                {list.sort((a,b) => new Date(a.date)-new Date(b.date)).map((h, i) => {
                  const holidayDate = new Date(h.date);
                  const isPast = holidayDate < now;
                  return (
                    <motion.div key={h._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 bg-[color:var(--bg-surface)] border rounded-xl p-4 shadow-sm ${isPast ? 'opacity-50' : 'border-[color:var(--border-subtle)]'}`}>
                      <div className="w-14 h-14 rounded-xl bg-[color:var(--accent-primary)]/10 flex flex-col items-center justify-center text-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[color:var(--accent-primary)]">{holidayDate.toLocaleDateString('en-GB', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-[color:var(--accent-primary)] leading-none">{holidayDate.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[color:var(--text-primary)]">{h.name}</div>
                        {h.description && <div className="text-sm text-[color:var(--text-secondary)]">{h.description}</div>}
                        <div className="text-xs text-[color:var(--text-secondary)] mt-0.5">{holidayDate.toLocaleDateString('en-GB', { weekday: 'long' })}</div>
                      </div>
                      {!isPast && (
                        <button onClick={() => handleDelete(h._id)} disabled={deleting === h._id}
                          className="p-2 text-[color:var(--text-secondary)] hover:text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10 rounded-lg transition-colors">
                          {deleting === h._id ? <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Holiday Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[color:var(--text-primary)]">Add Holiday</h2>
                <button onClick={() => setShowModal(false)} className="p-1 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--bg-overlay)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1">Holiday Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    placeholder="e.g. Republic Day"
                    className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                    className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1">Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    placeholder="Optional note..."
                    className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[color:var(--border-subtle)] rounded-lg text-[color:var(--text-primary)] font-medium hover:bg-[color:var(--bg-overlay)] transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-[color:var(--accent-primary)] text-black font-bold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors text-sm disabled:opacity-50 flex justify-center items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" /> : null}
                  Save Holiday
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Holidays;
