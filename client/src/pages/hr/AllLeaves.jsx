import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, LayoutList, Filter, Search } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import EmployeeMonitoringDetails from '../../components/hr/EmployeeMonitoringDetails';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_COLORS = {
  pending:  'bg-[color:var(--status-pending)]/10 border-[color:var(--status-pending)]/30 text-[color:var(--status-pending)]',
  approved: 'bg-[color:var(--status-approved)]/10 border-[color:var(--status-approved)]/30 text-[color:var(--status-approved)]',
  rejected: 'bg-[color:var(--status-rejected)]/10 border-[color:var(--status-rejected)]/30 text-[color:var(--status-rejected)]',
};

const StatusPill = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
    {status}
  </span>
);

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
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeaves();
  };

  const filtered = (search && Array.isArray(leaves))
    ? leaves.filter(l => l.employee?.name?.toLowerCase().includes(search.toLowerCase()))
    : (Array.isArray(leaves) ? leaves : []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">All Leaves</h1>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">Organisation-wide leave records — read only</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[color:var(--text-secondary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by employee name..."
            className="w-full pl-9 pr-4 py-2 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] rounded-lg text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:outline-none focus:border-[color:var(--accent-primary)]"
          />
        </form>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[color:var(--bg-overlay)] border-b border-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
              <tr>
                {['Employee', 'Type', 'From', 'To', 'Days', 'Status', 'Applied', 'Manager'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)] text-[color:var(--text-primary)]">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-[color:var(--text-secondary)]">No leave records found</td></tr>
              ) : filtered.map((leave, i) => (
                <React.Fragment key={leave._id}>
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setExpandedId(expandedId === leave._id ? null : leave._id)}
                    className={`cursor-pointer transition-colors ${expandedId === leave._id ? 'bg-[color:var(--bg-overlay)]' : 'hover:bg-[color:var(--bg-overlay)]/60'}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="text-[color:var(--text-secondary)]">
                          {expandedId === leave._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{leave.employee?.name}</div>
                          <div className="text-xs text-[color:var(--text-secondary)]">{leave.employee?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 capitalize font-medium">{leave.leaveType}</td>
                    <td className="px-5 py-3.5">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 font-bold">{leave.numberOfDays}</td>
                    <td className="px-5 py-3.5"><StatusPill status={leave.status} /></td>
                    <td className="px-5 py-3.5 text-[color:var(--text-secondary)]">{new Date(leave.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5">{leave.applyTo?.name || '—'}</td>
                  </motion.tr>
                  {expandedId === leave._id && (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td colSpan="8" className="p-0 border-none">
                        <div className="p-6 bg-[color:var(--bg-overlay)]/40 border-y border-[color:var(--border-subtle)]/30">
                          <EmployeeMonitoringDetails 
                            employeeId={leave.employee?._id} 
                            employeeName={leave.employee?.name} 
                          />
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="px-5 py-3 border-t border-[color:var(--border-subtle)] flex items-center justify-between text-sm">
            <span className="text-[color:var(--text-secondary)]">Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1 border border-[color:var(--border-subtle)] rounded-md disabled:opacity-40 hover:bg-[color:var(--bg-overlay)] transition-colors">
                Prev
              </button>
              <button onClick={() => setPage(p => p+1)} disabled={page * LIMIT >= total}
                className="px-3 py-1 border border-[color:var(--border-subtle)] rounded-md disabled:opacity-40 hover:bg-[color:var(--bg-overlay)] transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllLeaves;
