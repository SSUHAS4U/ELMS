import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Search, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { PageHeader, Card, Badge, EmptyState, ResponsiveTable } from '../../components/ui';

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
  const d = (v) => new Date(v).toLocaleDateString('en-GB');

  const actionButtons = (leave) => (
    <div className="flex justify-end gap-2">
      <button onClick={() => handleAction(leave._id, 'approve')} aria-label="Approve"
        className="w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-[color:var(--success)] bg-[color:var(--success)]/12 hover:bg-[color:var(--success)] hover:text-[color:var(--accent-contrast)] transition-colors"><Check className="w-4 h-4" /></button>
      <button onClick={() => handleAction(leave._id, 'reject')} aria-label="Reject"
        className="w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-[color:var(--danger)] bg-[color:var(--danger)]/12 hover:bg-[color:var(--danger)] hover:text-white transition-colors"><X className="w-4 h-4" /></button>
    </div>
  );

  const columns = [
    { key: 'employee', header: 'Employee', mobile: 'title', render: (r) => (
      <span className="flex items-center gap-2.5 font-semibold">
        <span className="w-8 h-8 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent text-xs font-bold shrink-0">{r.employee?.name?.charAt(0)}</span>
        {r.employee?.name}
      </span>
    ) },
    { key: 'dept', header: 'Dept', tdClass: 'text-content-secondary', render: (r) => r.employee?.department?.name || '—' },
    { key: 'type', header: 'Type', tdClass: 'capitalize font-medium text-accent', render: (r) => r.leaveType },
    { key: 'from', header: 'From', tdClass: 'tabular-nums', render: (r) => d(r.startDate) },
    { key: 'to', header: 'To', tdClass: 'tabular-nums', render: (r) => d(r.endDate) },
    { key: 'days', header: 'Days', tdClass: 'font-semibold tabular-nums', render: (r) => r.numberOfDays },
    { key: 'reason', header: 'Reason', tdClass: 'text-content-secondary max-w-xs truncate', render: (r) => <span title={r.reason}>{r.reason}</span> },
    { key: 'actions', header: '', align: 'right', mobile: 'trailing', render: (r) => actionButtons(r) },
  ];

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
        <ResponsiveTable
          columns={columns}
          data={filtered}
          loading={loading}
          skeletonRows={3}
          empty={<EmptyState icon={CheckSquare} title="All caught up!" description="No pending approvals right now." />}
        />
      </Card>
    </div>
  );
};

export default Approvals;
