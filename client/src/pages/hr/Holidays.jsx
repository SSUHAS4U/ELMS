import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CalendarRange, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, Button, EmptyState, Modal, Skeleton } from '../../components/ui';

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

  const grouped = holidays.reduce((acc, h) => {
    const month = new Date(h.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    (acc[month] = acc[month] || []).push(h);
    return acc;
  }, {});
  const now = new Date();

  const field = 'w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Calendar" title="Holiday Calendar" icon={CalendarRange} subtitle="Manage organisation-wide holidays."
        actions={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add holiday</Button>} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon={CalendarRange} title="No holidays configured yet"
          action={<Button size="sm" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add the first holiday</Button>} />
      ) : (
        <div className="space-y-7">
          {Object.entries(grouped).map(([month, list]) => (
            <div key={month}>
              <h2 className="text-xs font-semibold text-content-tertiary uppercase tracking-[0.16em] mb-3">{month}</h2>
              <div className="space-y-2.5">
                {list.sort((a, b) => new Date(a.date) - new Date(b.date)).map((h, i) => {
                  const d = new Date(h.date);
                  const isPast = d < now;
                  return (
                    <motion.div key={h._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`glass-panel hover-lift flex items-center gap-4 p-4 ${isPast ? 'opacity-55' : ''}`}>
                      <div className="w-14 h-14 rounded-[var(--radius)] bg-[color:var(--accent-glow)] grid place-content-center text-center shrink-0 ring-1 ring-inset ring-accent/15">
                        <span className="text-xs font-semibold text-accent uppercase">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                        <span className="text-2xl font-bold text-accent leading-none font-display">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-content">{h.name}</div>
                        {h.description && <div className="text-sm text-content-secondary truncate">{h.description}</div>}
                        <div className="text-xs text-content-tertiary mt-0.5">{d.toLocaleDateString('en-GB', { weekday: 'long' })}</div>
                      </div>
                      {!isPast && (
                        <button onClick={() => handleDelete(h._id)} disabled={deleting === h._id} aria-label="Delete holiday"
                          className="w-9 h-9 grid place-items-center text-content-secondary hover:text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10 rounded-[var(--radius-sm)] transition-colors">
                          {deleting === h._id ? <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add holiday" icon={CalendarRange}
        footer={<>
          <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="flex-1" loading={saving} onClick={handleSave}>Save holiday</Button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-secondary block mb-1.5">Holiday name <span className="text-[color:var(--danger)]">*</span></label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Republic Day" className={field} />
          </div>
          <div>
            <label className="text-sm font-medium text-content-secondary block mb-1.5">Date <span className="text-[color:var(--danger)]">*</span></label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={field} />
          </div>
          <div>
            <label className="text-sm font-medium text-content-secondary block mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional note…" className={field} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Holidays;
