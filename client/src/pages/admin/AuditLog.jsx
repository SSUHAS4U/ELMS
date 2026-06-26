import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, EmptyState, Button, Skeleton } from '../../components/ui';

const ACTION_TONE = (action) => {
  if (action?.includes('delete') || action?.includes('reject')) return 'text-[color:var(--danger)] bg-[color:var(--danger)]/12';
  if (action?.includes('create') || action?.includes('approve')) return 'text-[color:var(--success)] bg-[color:var(--success)]/12';
  if (action?.includes('update') || action?.includes('edit')) return 'text-[color:var(--info)] bg-[color:var(--info)]/12';
  return 'text-content-secondary bg-overlay';
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const LIMIT = 20;

  useEffect(() => { api.get('/audit-log/actions').then((r) => setActions(r.data.actions || [])).catch(() => {}); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (actionFilter) params.append('action', actionFilter);
      const res = await api.get(`/audit-log?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const cols = ['Actor', 'Action', 'Description', 'Time'];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Compliance" title="Audit Log" icon={Shield} subtitle="Immutable trail of all system actions — read only."
        actions={<span className="text-sm text-content-secondary"><span className="font-bold text-content tabular-nums">{total}</span> entries</span>} />

      <Card className="p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-content-tertiary shrink-0" />
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="h-10 bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 text-sm focus:outline-none focus:border-accent min-w-[180px]">
          <option value="">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-xs text-content-tertiary hidden sm:inline">Filter by action type</span>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead><tr className="text-content-tertiary border-b border-line/60">
              {cols.map((h) => <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => <tr key={i} className="border-b border-line/40"><td colSpan={4} className="px-5 py-3"><Skeleton className="h-6 w-full" /></td></tr>)
              ) : logs.length === 0 ? (
                <tr><td colSpan={4}><EmptyState icon={Shield} title="No audit entries found" /></td></tr>
              ) : logs.map((log, i) => (
                <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-line/40 last:border-0 hover:bg-overlay/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-content">{log.actorName || log.actor?.name}</div>
                    <div className="text-xs text-content-secondary capitalize">{log.actor?.role}</div>
                  </td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-mono px-2 py-1 rounded-full ${ACTION_TONE(log.action)}`}>{log.action}</span></td>
                  <td className="px-5 py-3.5 text-content-secondary max-w-xs truncate" title={log.target}>{log.target}</td>
                  <td className="px-5 py-3.5 text-content-secondary text-xs tabular-nums">{new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-5 py-3 border-t border-line/60 flex items-center justify-between text-sm">
            <span className="text-content-secondary">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLog;
