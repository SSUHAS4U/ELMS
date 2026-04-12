import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const ACTION_COLOR = (action) => {
  if (action?.includes('delete') || action?.includes('reject')) return 'text-[color:var(--danger)] bg-[color:var(--danger)]/10';
  if (action?.includes('create') || action?.includes('approve')) return 'text-[color:var(--success)] bg-[color:var(--success)]/10';
  if (action?.includes('update') || action?.includes('edit')) return 'text-[color:var(--info)] bg-[color:var(--info)]/10';
  return 'text-[color:var(--text-secondary)] bg-[color:var(--bg-overlay)]';
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

  useEffect(() => {
    api.get('/audit-log/actions').then(r => setActions(r.data.actions || [])).catch(() => {});
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (actionFilter) params.append('action', actionFilter);
      const res = await api.get(`/audit-log?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (error) {
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Audit Log</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">Immutable trail of all system actions — read only</p>
        </div>
        <div className="text-sm text-[color:var(--text-secondary)]">
          <span className="font-bold text-[color:var(--text-primary)]">{total}</span> total entries
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-4 shadow-sm flex items-center gap-3">
        <Filter className="w-4 h-4 text-[color:var(--text-secondary)]" />
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)] min-w-[180px]">
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-xs text-[color:var(--text-secondary)]">Filter by action type (dynamically loaded from DB)</span>
      </div>

      {/* Table */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[color:var(--bg-overlay)] border-b border-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
              <tr>
                {['Actor', 'Action', 'Description', 'Time'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10">
                  <div className="flex justify-center"><div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-[color:var(--text-secondary)]">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No audit entries found
                </td></tr>
              ) : logs.map((log, i) => (
                <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-[color:var(--bg-overlay)]/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-[color:var(--text-primary)]">{log.actorName || log.actor?.name}</div>
                    <div className="text-xs text-[color:var(--text-secondary)] capitalize">{log.actor?.role}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-mono px-2 py-1 rounded-full ${ACTION_COLOR(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[color:var(--text-secondary)] max-w-xs truncate" title={log.target}>{log.target}</td>
                  <td className="px-5 py-3.5 text-[color:var(--text-secondary)] text-xs">
                    {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-[color:var(--border-subtle)] flex items-center justify-between text-sm">
            <span className="text-[color:var(--text-secondary)]">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 border border-[color:var(--border-subtle)] rounded-md disabled:opacity-40 hover:bg-[color:var(--bg-overlay)] transition-colors text-[color:var(--text-primary)]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="p-1.5 border border-[color:var(--border-subtle)] rounded-md disabled:opacity-40 hover:bg-[color:var(--bg-overlay)] transition-colors text-[color:var(--text-primary)]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
