import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Download, LogIn, Coffee, Timer, LogOut } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, StatCard, Card, Badge, EmptyState, Button, ResponsiveTable } from '../../components/ui';

const SwipeData = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ avgInTime: '00:00', avgBreakTime: '0h', avgWorkTime: '0h', avgOutTime: '00:00' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recordsRes, statsRes] = await Promise.all([
          api.get('/swipe/my').catch(() => ({ data: { records: [] } })),
          api.get('/swipe/stats').catch(() => ({ data: { stats: {} } })),
        ]);
        setRecords(recordsRes.data.records || []);
        if (statsRes.data.stats) setStats((s) => ({ ...s, ...statsRes.data.stats }));
      } catch {
        toast.error('Failed to load swipe data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const swipeTone = { present: 'approved', co: 'approved', wfh: 'info', lop: 'rejected' };
  const t = (v) => (v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');
  const columns = [
    { key: 'date', header: 'Date', mobile: 'title', tdClass: 'tabular-nums', render: (r) => new Date(r.date).toLocaleDateString('en-GB') },
    { key: 'in', header: 'In', tdClass: 'tabular-nums', render: (r) => t(r.inTime) },
    { key: 'out', header: 'Out', tdClass: 'tabular-nums', render: (r) => t(r.outTime) },
    { key: 'work', header: 'Work', tdClass: 'font-medium', render: (r) => (r.workDuration ? `${Math.floor(r.workDuration / 60)}h ${r.workDuration % 60}m` : '—') },
    { key: 'break', header: 'Break', tdClass: 'text-content-secondary', render: (r) => (r.breakDuration ? `${r.breakDuration}m` : '—') },
    { key: 'reg', header: 'Reg Hr', tdClass: 'text-[color:var(--danger)]', render: (r) => r.regularizeHours || '—' },
    { key: 'status', header: 'Status', mobile: 'trailing', render: (r) => <Badge tone={swipeTone[r.status] || 'neutral'}>{r.status || 'Unknown'}</Badge> },
  ];

  const stats4 = [
    { icon: LogIn, label: 'Avg in time', value: stats.avgInTime },
    { icon: Coffee, label: 'Avg break', value: stats.avgBreakTime },
    { icon: Timer, label: 'Avg work', value: stats.avgWorkTime },
    { icon: LogOut, label: 'Avg out', value: stats.avgOutTime },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Attendance" title="Swipe Data" icon={Clock}
        subtitle="Your daily attendance, working hours and regularizations."
        actions={<><Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export</Button><Button size="sm">Regularize</Button></>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats4.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-line/60 flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-content flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> Daily records</h2>
          <select className="h-9 bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 text-sm focus:outline-none focus:border-accent">
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
          </select>
        </div>
        <ResponsiveTable
          columns={columns}
          data={records}
          loading={loading}
          empty={<EmptyState icon={Clock} title="No swipe records" description="No attendance found for this period." />}
        />
      </Card>
    </div>
  );
};

export default SwipeData;
