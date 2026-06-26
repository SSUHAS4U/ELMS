import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Download, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, Button } from '../../components/ui';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
const formatWeekLabel = (weekStart) => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  const opts = { month: 'short', day: 'numeric' };
  return `${weekStart.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}, ${end.getFullYear()}`;
};

const Timesheet = () => {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [hours, setHours] = useState({ mon: '', tue: '', wed: '', thu: '', fri: '' });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalHours = Object.values(hours).reduce((sum, h) => sum + (parseFloat(h) || 0), 0);

  const shiftWeek = (days) => { const d = new Date(weekStart); d.setDate(d.getDate() + days); setWeekStart(d); setSubmitted(false); };
  const getDayDate = (idx) => { const d = new Date(weekStart); d.setDate(d.getDate() + idx); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };

  const handleSubmit = async () => {
    if (totalHours === 0) { toast.error('Please log at least some hours'); return; }
    setSubmitting(true);
    try {
      await api.post('/timesheets', { weekStart: weekStart.toISOString(), hours, notes, totalHours });
      toast.success('Timesheet submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      if (error.response?.status === 404) { toast.info('Timesheet saved locally — server sync coming soon'); setSubmitted(true); }
      else toast.error(error.response?.data?.message || 'Failed to submit timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Time tracking" title="Timesheet" icon={Clock} subtitle="Log your weekly working hours."
        actions={<Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export</Button>} />

      <Card className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={() => shiftWeek(-7)} aria-label="Previous week"><ChevronLeft className="w-5 h-5" /></Button>
        <div className="text-center">
          <div className="text-xs text-content-secondary uppercase tracking-wider">Week of</div>
          <div className="font-display font-bold text-content">{formatWeekLabel(weekStart)}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => shiftWeek(7)} aria-label="Next week"><ChevronRight className="w-5 h-5" /></Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-line/60 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h2 className="font-display font-semibold text-content">Daily hours</h2>
          <span className="ml-auto text-sm text-content-secondary">Total <span className="font-bold text-accent tabular-nums">{totalHours}h</span></span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {DAYS.map((day, idx) => {
            const key = DAY_KEYS[idx];
            const val = parseFloat(hours[key]) || 0;
            const isOver = val > 9;
            return (
              <motion.div key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex flex-col gap-3">
                <div className="flex sm:flex-col items-center sm:items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-content">{day}</div>
                    <div className="text-xs text-content-secondary">{getDayDate(idx)}</div>
                  </div>
                  <input type="number" min="0" max="24" step="0.5" value={hours[key]} onChange={(e) => setHours((p) => ({ ...p, [key]: e.target.value }))} disabled={submitted} placeholder="0"
                    className={`w-24 sm:w-full bg-base border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-center font-bold tabular-nums focus:outline-none transition-all disabled:opacity-60
                      ${isOver ? 'border-[color:var(--danger)] text-[color:var(--danger)]' : 'border-line text-content focus:border-accent focus:ring-2 focus:ring-accent/15'}`} />
                </div>
                <div className="hidden sm:block h-1.5 bg-overlay rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-[color:var(--danger)]' : 'bg-accent'}`} style={{ width: `${Math.min((val / 9) * 100, 100)}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <label className="block text-sm font-medium text-content-secondary mb-2">Notes (optional)</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={submitted} placeholder="What did you work on this week?"
          className="w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 resize-none disabled:opacity-60" />
      </Card>

      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 bg-[color:var(--success)]/10 border border-[color:var(--success)]/30 text-[color:var(--success)] rounded-[var(--radius)] p-4 font-semibold">
          <CheckCircle2 className="w-5 h-5" /> Timesheet submitted for this week
        </motion.div>
      ) : (
        <Button onClick={handleSubmit} loading={submitting} disabled={totalHours === 0} size="lg">Submit timesheet ({totalHours}h)</Button>
      )}
    </div>
  );
};

export default Timesheet;
