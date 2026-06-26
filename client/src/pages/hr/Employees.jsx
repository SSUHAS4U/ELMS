import { useEffect, useState } from 'react';
import { Search, Users, Phone, Mail, Building2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, MotionCard, Badge, EmptyState, Button, SkeletonCard } from '../../components/ui';

const HREmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => { api.get('/departments').then((r) => setDepartments(r.data.departments || [])).catch(() => {}); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'employee', active: 'true', page, limit: LIMIT });
      if (deptFilter) params.append('department', deptFilter);
      const res = await api.get(`/users?${params}`);
      setEmployees(res.data.users || []);
      setTotal(res.data.count || 0);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchEmployees(); }, [page, deptFilter]);

  const filtered = search
    ? employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()))
    : employees;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Directory" title="Employees" icon={Users} subtitle="Browse the active employee directory."
        actions={<span className="text-sm text-content-secondary"><span className="font-bold text-content tabular-nums">{total}</span> active</span>} />

      <Card className="flex flex-col sm:flex-row gap-3 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full h-10 pl-9 pr-4 bg-base border border-line rounded-[var(--radius-sm)] text-sm text-content placeholder:text-content-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
        </div>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="h-10 bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 text-sm focus:outline-none focus:border-accent">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No employees found" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp, i) => (
              <MotionCard key={emp._id} delay={i * 0.04} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--accent-glow)] ring-1 ring-inset ring-accent/20 flex items-center justify-center text-accent font-bold text-lg shrink-0">{emp.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-content truncate">{emp.name}</div>
                    <div className="text-xs text-content-secondary capitalize">{emp.designation || emp.role}</div>
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-content-secondary truncate"><Mail className="w-3.5 h-3.5 shrink-0" /> {emp.email}</div>
                      {emp.department && <div className="flex items-center gap-1.5 text-xs text-content-secondary"><Building2 className="w-3.5 h-3.5 shrink-0" /> {emp.department?.name || emp.department}</div>}
                      {emp.phone && <div className="flex items-center gap-1.5 text-xs text-content-secondary"><Phone className="w-3.5 h-3.5 shrink-0" /> {emp.phone}</div>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between">
                  <Badge tone="approved">Active</Badge>
                  {emp.employeeId && <span className="text-xs text-content-tertiary font-mono">{emp.employeeId}</span>}
                </div>
              </MotionCard>
            ))}
          </div>

          {total > LIMIT && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-content-secondary">Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * LIMIT >= total}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HREmployees;
