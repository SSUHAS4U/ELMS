import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, ListTodo } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import EmployeeMonitoringDetails from '../../components/hr/EmployeeMonitoringDetails';
import { PageHeader, Card, Badge, EmptyState, Button, Skeleton } from '../../components/ui';

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const LIMIT = 20;

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await api.get(`/leaves/all?${params}`);
      setLeaves(res.data.leaves || []);
      setTotal(res.data.count || 0);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchLeaves(); }, [page, statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLeaves(); };
  const filtered = search && Array.isArray(leaves)
    ? leaves.filter((l) => l.employee?.name?.toLowerCase().includes(search.toLowerCase()))
    : Array.isArray(leaves) ? leaves : [];
  const cols = ['Employee', 'Type', 'From', 'To', 'Days', 'Status', 'Applied', 'Manager'];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Organization" title="All Leaves" icon={ListTodo} subtitle="Organisation-wide leave records — click a row to inspect attendance." />

      <Card className="flex flex-col sm:flex-row gap-3 p-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee name…"
            className="w-full h-10 pl-9 pr-4 bg-base border border-line rounded-[var(--radius-sm)] text-sm text-content placeholder:text-content-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 text-sm focus:outline-none focus:border-accent">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead><tr className="text-content-tertiary border-b border-line/60">
              {cols.map((h) => <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => <tr key={i} className="border-b border-line/40"><td colSpan={8} className="px-5 py-3"><Skeleton className="h-6 w-full" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={ListTodo} title="No leave records found" /></td></tr>
              ) : filtered.map((leave, i) => (
                <React.Fragment key={leave._id}>
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                    onClick={() => setExpandedId(expandedId === leave._id ? null : leave._id)}
                    className={`cursor-pointer border-b border-line/40 transition-colors ${expandedId === leave._id ? 'bg-overlay/60' : 'hover:bg-overlay/40'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-content-tertiary">{expandedId === leave._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                        <div>
                          <div className="font-medium text-content">{leave.employee?.name}</div>
                          <div className="text-xs text-content-secondary">{leave.employee?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 capitalize font-medium">{leave.leaveType}</td>
                    <td className="px-5 py-3.5 tabular-nums">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 tabular-nums">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums">{leave.numberOfDays}</td>
                    <td className="px-5 py-3.5"><Badge status={leave.status} /></td>
                    <td className="px-5 py-3.5 text-content-secondary tabular-nums">{new Date(leave.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5">{leave.applyTo?.name || '—'}</td>
                  </motion.tr>
                  {expandedId === leave._id && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      <td colSpan={8} className="p-0 border-b border-line/40">
                        <div className="p-6 bg-overlay/30">
                          <EmployeeMonitoringDetails employeeId={leave.employee?._id} employeeName={leave.employee?.name} />
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {total > LIMIT && (
          <div className="px-5 py-3 border-t border-line/60 flex items-center justify-between text-sm">
            <span className="text-content-secondary">Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * LIMIT >= total}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AllLeaves;
