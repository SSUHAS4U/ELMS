import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Download, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const REPORT_TYPES = [
  { key: 'leave-summary', label: 'Leave Summary Report', desc: 'All leave requests grouped by type and status' },
  { key: 'attendance', label: 'Attendance Report', desc: 'Daily attendance records for all employees' },
  { key: 'leave-balance', label: 'Leave Balance Report', desc: 'Current leave balances across all employees' },
];

const HRReports = () => {
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
      link.download = `${reportKey}-${fromDate}-${toDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (error) {
      // Endpoint not yet implemented — show placeholder
      toast.info(`Report generation for "${reportKey}" will be available when the reports API is ready`);
    } finally {
      setGenerating(g => ({ ...g, [reportKey]: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">HR Reports</h1>
        <p className="text-sm text-[color:var(--text-secondary)] mt-1">Generate and download reports — all data is fresh at download time</p>
      </div>

      {/* Date Range */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[color:var(--accent-primary)]" /> Date Range
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

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report, i) => (
          <motion.div key={report.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--accent-primary)]/10 flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-[color:var(--accent-primary)]" />
                </div>
                <div className="font-bold text-[color:var(--text-primary)] text-sm">{report.label}</div>
              </div>
              <p className="text-xs text-[color:var(--text-secondary)]">{report.desc}</p>
            </div>
            <button
              onClick={() => generateReport(report.key)}
              disabled={generating[report.key]}
              className="mt-auto flex items-center gap-2 px-4 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors text-sm disabled:opacity-50"
            >
              {generating[report.key]
                ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" />
                : <Download className="w-4 h-4" />}
              Generate {fromDate.slice(0,7)} to {toDate.slice(0,7)}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HRReports;
