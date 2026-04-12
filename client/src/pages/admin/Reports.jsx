import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Download, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const REPORT_TYPES = [
  { key: 'employees', label: 'Employee Report', desc: 'Full employee list with department, role, joining date' },
  { key: 'leave-summary', label: 'Leave Summary Report', desc: 'All leave requests grouped by type and status across the org' },
  { key: 'attendance', label: 'Attendance Report', desc: 'Daily attendance records for all departments' },
  { key: 'leave-balance', label: 'Leave Balance Report', desc: 'Current leave balances across all active employees' },
  { key: 'audit', label: 'Audit Trail Export', desc: 'System audit log for compliance and security review' },
  { key: 'department-summary', label: 'Department Summary', desc: 'Headcount and activity per department' },
];

const AdminReports = () => {
  const now = new Date();
  const [fromDate, setFromDate] = useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`);
  const [toDate, setToDate] = useState(now.toISOString().slice(0, 10));
  const [generating, setGenerating] = useState({});

  const generateReport = async (reportKey) => {
    setGenerating(g => ({ ...g, [reportKey]: true }));
    try {
      const res = await api.get(`/reports/${reportKey}?from=${fromDate}&to=${toDate}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elms-${reportKey}-${fromDate}-to-${toDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (error) {
      toast.info(`"${reportKey}" report endpoint is pending implementation on the backend`);
    } finally {
      setGenerating(g => ({ ...g, [reportKey]: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Admin Reports</h1>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">All reports fetch fresh data at download time — no cached files</p>
      </div>

      {/* Date Range */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[color:var(--accent-primary)]" /> Report Date Range
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report, i) => (
          <motion.div key={report.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm flex flex-col gap-4 hover:border-[color:var(--accent-primary)]/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[color:var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                <FileBarChart className="w-5 h-5 text-[color:var(--accent-primary)]" />
              </div>
              <div>
                <div className="font-bold text-[color:var(--text-primary)] text-sm">{report.label}</div>
                <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">{report.desc}</p>
              </div>
            </div>
            <button
              onClick={() => generateReport(report.key)}
              disabled={generating[report.key]}
              className="mt-auto flex items-center justify-center gap-2 px-4 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors text-sm disabled:opacity-50">
              {generating[report.key]
                ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" />
                : <Download className="w-4 h-4" />}
              Download CSV
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
