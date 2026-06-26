import { useState } from 'react';
import { FileBarChart, Download, CalendarRange, ClipboardList, Scale } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, MotionCard, Button } from '../../components/ui';

const REPORT_TYPES = [
  { key: 'leave-summary', label: 'Leave Summary Report', desc: 'All leave requests grouped by type and status', icon: ClipboardList },
  { key: 'attendance', label: 'Attendance Report', desc: 'Daily attendance records for all employees', icon: CalendarRange },
  { key: 'leave-balance', label: 'Leave Balance Report', desc: 'Current leave balances across all employees', icon: Scale },
];

const HRReports = () => {
  const now = new Date();
  const [fromDate, setFromDate] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [toDate, setToDate] = useState(now.toISOString().slice(0, 10));
  const [generating, setGenerating] = useState({});

  const generateReport = async (reportKey) => {
    setGenerating((g) => ({ ...g, [reportKey]: true }));
    try {
      const res = await api.get(`/reports/${reportKey}?from=${fromDate}&to=${toDate}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportKey}-${fromDate}-${toDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.info(`Report generation for "${reportKey}" will be available when the reports API is ready`);
    } finally {
      setGenerating((g) => ({ ...g, [reportKey]: false }));
    }
  };

  const field = 'w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Exports" title="HR Reports" icon={FileBarChart} subtitle="Generate and download reports — data is fresh at download time." />

      <Card className="p-5">
        <h2 className="font-display font-semibold text-content mb-4 flex items-center gap-2"><CalendarRange className="w-4 h-4 text-accent" /> Date range</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1.5">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1.5">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={field} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report, i) => (
          <MotionCard key={report.key} delay={i * 0.08} className="p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[color:var(--accent-glow)] grid place-items-center text-accent ring-1 ring-inset ring-accent/15"><report.icon className="w-5 h-5" /></div>
                <div className="font-display font-semibold text-content text-sm">{report.label}</div>
              </div>
              <p className="text-sm text-content-secondary">{report.desc}</p>
            </div>
            <Button className="mt-auto w-full" loading={generating[report.key]} onClick={() => generateReport(report.key)}>
              {!generating[report.key] && <Download className="w-4 h-4" />} Generate CSV
            </Button>
          </MotionCard>
        ))}
      </div>
    </div>
  );
};

export default HRReports;
