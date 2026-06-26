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
  const d = (v) => new Date(v).toLocaleDateString('en-GB');
  const columns = [
    { key: 'employee', header: 'Employee', mobile: 'title', render: (r) => (
      <div><div className="font-medium text-content">{r.employee?.name}</div><div className="text-xs text-content-secondary truncate">{r.employee?.email}</div></div>
    ) },
    { key: 'type', header: 'Type', tdClass: 'capitalize font-medium', render: (r) => r.leaveType },
    { key: 'from', header: 'From', tdClass: 'tabular-nums', render: (r) => d(r.startDate) },
    { key: 'to', header: 'To', tdClass: 'tabular-nums', render: (r) => d(r.endDate) },
    { key: 'days', header: 'Days', tdClass: 'font-semibold tabular-nums', render: (r) => r.numberOfDays },
    { key: 'status', header: 'Status', mobile: 'trailing', render: (r) => <Badge status={r.status} /> },
    { key: 'applied', header: 'Applied', tdClass: 'text-content-secondary tabular-nums', render: (r) => d(r.createdAt) },
    { key: 'manager', header: 'Manager', tdClass: 'text-content-secondary', render: (r) => r.applyTo?.name || '—' },
  ];

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
        <ResponsiveTable
          columns={columns}
          data={filtered}
          loading={loading}
          skeletonRows={5}
          empty={<EmptyState icon={ListTodo} title="No leave records found" />}
          onRowClick={(r) => setExpandedId(expandedId === r._id ? null : r._id)}
          isRowExpanded={(r) => expandedId === r._id}
          renderExpanded={(r) => <EmployeeMonitoringDetails employeeId={r.employee?._id} employeeName={r.employee?.name} />}
        />

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
