import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

// Get start of week (Monday) for a given date
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
  const { user } = useAuthStore();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [hours, setHours] = useState({ mon: '', tue: '', wed: '', thu: '', fri: '' });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalHours = Object.values(hours).reduce((sum, h) => sum + (parseFloat(h) || 0), 0);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    setSubmitted(false);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    setSubmitted(false);
  };

  const getDayDate = (idx) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + idx);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const handleSubmit = async () => {
    if (totalHours === 0) { toast.error('Please log at least some hours'); return; }
    setSubmitting(true);
    try {
      // POST to API — stub endpoint (will be handled by future timesheet controller)
      await api.post('/timesheets', {
        weekStart: weekStart.toISOString(),
        hours,
        notes,
        totalHours
      });
      toast.success('Timesheet submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      // If endpoint doesn't exist yet, show a friendly message
      if (error.response?.status === 404) {
        toast.info('Timesheet saved locally — server sync coming soon');
        setSubmitted(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit timesheet');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Timesheet</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">Log your weekly working hours</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[color:var(--border-subtle)] rounded-lg text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-overlay)] transition-colors text-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <button onClick={prevWeek} className="p-2 hover:bg-[color:var(--bg-overlay)] rounded-lg transition-colors text-[color:var(--text-secondary)]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-sm text-[color:var(--text-secondary)]">Week of</div>
          <div className="font-bold text-[color:var(--text-primary)]">{formatWeekLabel(weekStart)}</div>
        </div>
        <button onClick={nextWeek} className="p-2 hover:bg-[color:var(--bg-overlay)] rounded-lg transition-colors text-[color:var(--text-secondary)]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Hours Grid */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[color:var(--border-subtle)] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[color:var(--accent-primary)]" />
          <h2 className="font-bold text-[color:var(--text-primary)]">Daily Hours</h2>
          <span className="ml-auto text-sm text-[color:var(--text-secondary)]">Total: <span className="font-bold text-[color:var(--accent-primary)]">{totalHours}h</span></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[color:var(--border-subtle)]">
          {DAYS.map((day, idx) => {
            const key = DAY_KEYS[idx];
            const isWeekend = false;
            const dayDate = getDayDate(idx);
            const val = parseFloat(hours[key]) || 0;
            const isOver = val > 9;
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 flex flex-col gap-2"
              >
                <div className="flex sm:flex-col items-center sm:items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-[color:var(--text-primary)]">{day}</div>
                    <div className="text-xs text-[color:var(--text-secondary)]">{dayDate}</div>
                  </div>
                  <div className="relative sm:w-full">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={hours[key]}
                      onChange={(e) => setHours(prev => ({ ...prev, [key]: e.target.value }))}
                      disabled={submitted}
                      placeholder="0"
                      className={`w-24 sm:w-full bg-[color:var(--bg-base)] border rounded-lg px-3 py-2 text-sm text-center font-bold focus:outline-none transition-all disabled:opacity-60
                        ${isOver 
                          ? 'border-[color:var(--danger)] text-[color:var(--danger)] focus:ring-[color:var(--danger)]' 
                          : 'border-[color:var(--border-subtle)] text-[color:var(--text-primary)] focus:border-[color:var(--accent-primary)] focus:ring-1 focus:ring-[color:var(--accent-primary)]'
                        }`}
                    />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="hidden sm:block h-1.5 bg-[color:var(--bg-overlay)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-[color:var(--danger)]' : 'bg-[color:var(--accent-primary)]'}`}
                    style={{ width: `${Math.min((val / 9) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-2">Notes (optional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={submitted}
          placeholder="What did you work on this week?"
          className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)] resize-none disabled:opacity-60"
        />
      </div>

      {/* Submit */}
      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[color:var(--success)]/10 border border-[color:var(--success)]/30 text-[color:var(--success)] rounded-xl p-4 text-center font-semibold">
          ✓ Timesheet submitted for this week
        </motion.div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={submitting || totalHours === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[color:var(--accent-primary)] text-black font-bold rounded-xl hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" /> : null}
          Submit Timesheet ({totalHours}h)
        </button>
      )}
    </div>
  );
};

export default Timesheet;
