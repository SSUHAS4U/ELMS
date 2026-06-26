import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarRange, TrendingUp, CheckCircle, Cake, Award } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PageHeader, StatCard, Card, CardHeader, CardTitle, Badge, EmptyState, Skeleton } from '../../components/ui';

const CHART_COLORS = ['#00C96B', '#8B7CFF', '#FFB020', '#FF4D6A', '#4DFFA8', '#5BA8FF'];

const ChartCard = ({ title, loading, empty, emptyText, children }) => (
  <Card className="p-5">
    <CardTitle className="mb-4">{title}</CardTitle>
    <div className="h-64 w-full">
      {loading ? <Skeleton className="w-full h-full" /> : empty ? <EmptyState title={emptyText} className="py-12" /> : children}
    </div>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, onLeaveToday: 0, newHiresThisMonth: 0 });
  const [deptStats, setDeptStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [leaveTypeDist, setLeaveTypeDist] = useState([]);
  const [attendanceRate, setAttendanceRate] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [sum, dept, trnd, ltDist, att, pend, bday] = await Promise.all([
          api.get('/analytics/summary'), api.get('/analytics/department'), api.get('/analytics/trends'),
          api.get('/analytics/leave-types'), api.get('/analytics/attendance'), api.get('/leaves/pending'), api.get('/analytics/birthdays'),
        ]);
        setStats(sum.data.data); setDeptStats(dept.data.data); setTrends(trnd.data.data);
        setLeaveTypeDist(ltDist.data.data); setAttendanceRate(att.data.data);
        setPendingQueue((pend.data.leaves || []).slice(0, 10)); setBirthdays(bday.data.data || []);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/leaves/${id}/approve`, { approvalNote: 'Approved from dashboard' });
      toast.success('Leave approved');
      setPendingQueue((q) => q.filter((l) => l._id !== id));
      setStats((s) => ({ ...s, pendingLeaves: Math.max(0, s.pendingLeaves - 1) }));
    } catch { toast.error('Failed to approve'); }
  };

  const tooltipStyle = { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '12px', boxShadow: 'var(--glass-shadow)' };

  const kpis = [
    { icon: Users, label: 'Total personnel', value: loading ? '—' : stats.totalEmployees },
    { icon: Clock, label: 'Pending leaves', value: loading ? '—' : stats.pendingLeaves },
    { icon: CalendarRange, label: 'On leave today', value: loading ? '—' : stats.onLeaveToday },
    { icon: TrendingUp, label: 'New hires (mo)', value: loading ? '—' : stats.newHiresThisMonth },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Control center" title="System Overview" icon={Users} subtitle="Live monitoring and organisational analytics." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Personnel by department" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip cursor={{ fill: 'var(--bg-overlay)' }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave days trend (12 months)" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="totalDays" stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#areaGrad)" name="Days" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Leave type distribution (year)" loading={loading} empty={leaveTypeDist.length === 0} emptyText="No approved leaves yet this year">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={leaveTypeDist} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" nameKey="name" paddingAngle={3}>
                {leaveTypeDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`]} />
              <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'capitalize' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="p-5">
          <CardTitle className="mb-4">Attendance rate by department</CardTitle>
          {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8" />)}</div>
            : attendanceRate.length === 0 ? <EmptyState title="No attendance data this month" className="py-10" />
            : (
              <div className="space-y-4 mt-2">
                {attendanceRate.map((dept, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-content font-medium">{dept.department}</span>
                      <span className="font-semibold text-accent tabular-nums">{dept.rate}%</span>
                    </div>
                    <div className="h-2.5 bg-overlay rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${dept.rate}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full" style={{ background: dept.rate >= 80 ? 'var(--success)' : dept.rate >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[color:var(--warning)]" /> Pending leave queue</CardTitle>
            <span className="text-xs font-bold text-[color:var(--warning)] bg-[color:var(--warning)]/12 px-2 py-0.5 rounded-full">{pendingQueue.length}</span>
          </CardHeader>
          {loading ? <div className="p-5 pt-0 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            : pendingQueue.length === 0 ? <EmptyState icon={CheckCircle} title="All clear" description="No pending requests." />
            : (
              <div className="divide-y divide-line/60">
                {pendingQueue.map((leave, i) => (
                  <motion.div key={leave._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-overlay/40 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent font-bold text-sm shrink-0">{leave.employee?.name?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-content truncate">{leave.employee?.name}</div>
                      <div className="text-xs text-content-secondary capitalize">{leave.leaveType} · {leave.numberOfDays}d · {new Date(leave.startDate).toLocaleDateString('en-GB')}</div>
                    </div>
                    <button onClick={() => handleApprove(leave._id)}
                      className="shrink-0 text-xs px-3 py-1.5 bg-[color:var(--success)]/12 text-[color:var(--success)] border border-[color:var(--success)]/25 rounded-full font-semibold hover:bg-[color:var(--success)]/20 transition-colors">Approve</button>
                  </motion.div>
                ))}
              </div>
            )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><Cake className="w-4 h-4 text-[color:var(--info)]" /> This month</CardTitle></CardHeader>
          {loading ? <div className="p-5 pt-0 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            : birthdays.length === 0 ? <EmptyState icon={Cake} title="Nothing this month" />
            : (
              <div className="divide-y divide-line/60">
                {birthdays.slice(0, 7).map((item) => (
                  <div key={`${item._id}-${item.type}`} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
                      {item.type === 'birthday' ? <Cake className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-content truncate">{item.name}</div>
                      <div className="text-xs text-content-secondary">
                        {item.type === 'birthday' ? `Birthday · ${new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : `${item.years}yr anniversary · ${new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
