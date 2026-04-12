import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Phone, Mail, Building2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const HREmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.departments || [])).catch(() => {});
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: 'employee', active: 'true', page, limit: LIMIT });
      if (deptFilter) params.append('department', deptFilter);
      const res = await api.get(`/users?${params}`);
      setEmployees(res.data.users || []);
      setTotal(res.data.count || 0);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [page, deptFilter]);

  const filtered = search
    ? employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()))
    : employees;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Employees</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">Employee directory — HR view</p>
        </div>
        <div className="text-sm text-[color:var(--text-secondary)]">
          <span className="font-bold text-[color:var(--text-primary)]">{total}</span> active employees
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[color:var(--text-secondary)]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] rounded-lg text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:outline-none focus:border-[color:var(--accent-primary)]"
          />
        </div>
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          className="bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp, i) => (
              <motion.div key={emp._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-[color:var(--accent-primary)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--accent-primary)]/10 border border-[color:var(--accent-primary)]/20 flex items-center justify-center text-[color:var(--accent-primary)] font-bold text-lg flex-shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[color:var(--text-primary)] truncate">{emp.name}</div>
                    <div className="text-xs text-[color:var(--text-secondary)] capitalize">{emp.designation || emp.role}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-secondary)] truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" /> {emp.email}
                      </div>
                      {emp.department && (
                        <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-secondary)]">
                          <Building2 className="w-3 h-3 flex-shrink-0" /> {emp.department?.name || emp.department}
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-secondary)]">
                          <Phone className="w-3 h-3 flex-shrink-0" /> {emp.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[color:var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/20 font-semibold">
                    Active
                  </span>
                  {emp.employeeId && (
                    <span className="text-xs text-[color:var(--text-secondary)] font-mono">{emp.employeeId}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-[color:var(--bg-surface)] border border-dashed border-[color:var(--border-subtle)] rounded-xl text-[color:var(--text-secondary)]">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              No employees found
            </div>
          )}

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[color:var(--text-secondary)]">Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="px-4 py-1.5 border border-[color:var(--border-subtle)] rounded-lg disabled:opacity-40 hover:bg-[color:var(--bg-overlay)] transition-colors text-[color:var(--text-primary)]">Prev</button>
                <button onClick={() => setPage(p => p+1)} disabled={page*LIMIT >= total}
                  className="px-4 py-1.5 border border-[color:var(--border-subtle)] rounded-lg disabled:opacity-40 hover:bg-[color:var(--bg-overlay)] transition-colors text-[color:var(--text-primary)]">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HREmployees;
