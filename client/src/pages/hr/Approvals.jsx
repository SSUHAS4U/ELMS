import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Search, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { PageHeader, Card, EmptyState, Skeleton } from '../../components/ui';

const Approvals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/pending');
      setLeaves(res.data.leaves);
    } catch {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/leaves/${id}/${action}`, { approvalNote: `Processed by HR (${action})` });
      toast.success(`Leave ${action}d successfully`);
      setLeaves((prev) => prev.filter((l) => l._id !== id));
    } catch {
      toast.error(`Failed to ${action} leave`);
    }
  };

  const filtered = leaves.filter((l) => l.employee?.name?.toLowerCase().includes(query.toLowerCase()));
  const cols = ['Employee', 'Dept', 'Type', 'From', 'To', 'Days', 'Reason', ''];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Review queue" title="Pending Approvals" icon={CheckSquare}
        subtitle="Review and action leave requests routed to you."
        actions={
          <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 text-sm font-bold rounded-full bg-[color:var(--warning)]/15 text-[color:var(--warning)]">{leaves.length}</span>
        } />

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-line/60 flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-content">Queue</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employee…"
              className="h-9 pl-9 pr-3 text-sm bg-base border border-line rounded-[var(--radius-sm)] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 text-content placeholder:text-content-tertiary" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead><tr className="text-content-tertiary border-b border-line/60">
              {cols.map((c, i) => <th key={i} className={`px-5 py-3 font-semibold text-[11px] tracking-wider uppercase ${i === 7 ? 'text-right' : ''}`}>{c}</th>)}
            </tr></thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => <tr key={i} className="border-b border-line/40"><td colSpan={8} className="px-5 py-3"><Skeleton className="h-6 w-full" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={CheckSquare} title="All caught up!" description="No pending approvals right now." /></td></tr>
              ) : (
                filtered.map((leave, i) => (
                  <motion.tr key={leave._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-line/40 last:border-0 hover:bg-overlay/40 transition-colors">
                    <td className="px-5 py-3.5 font-semibold">
                      <span className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent text-xs font-bold">{leave.employee?.name?.charAt(0)}</span>
                        {leave.employee?.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-content-secondary">{leave.employee?.department?.name || '—'}</td>
                    <td className="px-5 py-3.5 capitalize font-medium text-accent">{leave.leaveType}</td>
                    <td className="px-5 py-3.5 tabular-nums">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 tabular-nums">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums">{leave.numberOfDays}</td>
                    <td className="px-5 py-3.5 text-content-secondary max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(leave._id, 'approve')} aria-label="Approve"
                          className="w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-[color:var(--success)] bg-[color:var(--success)]/12 hover:bg-[color:var(--success)] hover:text-[color:var(--accent-contrast)] transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleAction(leave._id, 'reject')} aria-label="Reject"
                          className="w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-[color:var(--danger)] bg-[color:var(--danger)]/12 hover:bg-[color:var(--danger)] hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Approvals;
