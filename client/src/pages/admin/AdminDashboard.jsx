import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarRange, TrendingUp, CheckCircle, Shield, Gift, Cake } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#008A4A', '#7B61FF', '#FFAA00', '#FF4466', '#00C9FF', '#00FF87'];

const ChartCard = ({ title, loading, children }) => (
  <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5 shadow-sm">
    <h3 className="font-bold text-base text-[color:var(--text-primary)] mb-4">{title}</h3>
    <div className="h-64 w-full">
      {loading ? (
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, colorClass, loading, sub }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="p-5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] flex items-center justify-between shadow-sm overflow-hidden relative">
    <div className="z-10">
      <p className="text-xs font-semibold tracking-wider uppercase text-[color:var(--text-secondary)] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-[color:var(--text-primary)]">{loading ? '—' : value}</h3>
      {sub && <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">{sub}</p>}
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
      <Icon className="w-28 h-28" />
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, onLeaveToday: 0, newHiresThisMonth: 0, approvedThisYear: 0 });
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
          api.get('/analytics/summary'),
          api.get('/analytics/department'),
          api.get('/analytics/trends'),
          api.get('/analytics/leave-types'),
          api.get('/analytics/attendance'),
          api.get('/leaves/pending'),
          api.get('/analytics/birthdays'),
        ]);
        setStats(sum.data.data);
        setDeptStats(dept.data.data);
        setTrends(trnd.data.data);
        setLeaveTypeDist(ltDist.data.data);
        setAttendanceRate(att.data.data);
        setPendingQueue((pend.data.leaves || []).slice(0, 10));
        setBirthdays(bday.data.data || []);
      } catch (error) {
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
      setPendingQueue(q => q.filter(l => l._id !== id));
      setStats(s => ({ ...s, pendingLeaves: Math.max(0, s.pendingLeaves - 1) }));
    } catch { toast.error('Failed to approve'); }
  };

  const tooltipStyle = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '12px'
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">System Overview</h1>
        <p className="text-[color:var(--text-secondary)] text-sm mt-1">Live monitoring and organisational analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Personnel" value={stats.totalEmployees} icon={Users} colorClass="bg-[color:var(--info)]/20 text-[color:var(--info)]" loading={loading} />
        <MetricCard title="Pending Leaves" value={stats.pendingLeaves} icon={Clock} colorClass="bg-[color:var(--warning)]/20 text-[color:var(--warning)]" loading={loading} />
        <MetricCard title="On Leave Today" value={stats.onLeaveToday} icon={CalendarRange} colorClass="bg-[color:var(--danger)]/20 text-[color:var(--danger)]" loading={loading} />
        <MetricCard title="New Hires" value={stats.newHiresThisMonth} icon={TrendingUp} colorClass="bg-[color:var(--success)]/20 text-[color:var(--success)]" loading={loading} sub="this month" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Personnel by Department" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip cursor={{ fill: 'var(--bg-overlay)' }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave Days Trend (12 Months)" loading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--info)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="totalDays" stroke="var(--info)" strokeWidth={2} fill="url(#areaGrad)" name="Days" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leave Type Donut */}
        <ChartCard title="Leave Type Distribution (This Year)" loading={loading}>
          {leaveTypeDist.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[color:var(--text-secondary)] text-sm">No approved leaves yet this year</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leaveTypeDist} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" nameKey="name" paddingAngle={3}>
                  {leaveTypeDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`]} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Attendance Rate per Department */}
        <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5 shadow-sm">
          <h3 className="font-bold text-base text-[color:var(--text-primary)] mb-4">Attendance Rate by Department</h3>
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
          ) : attendanceRate.length === 0 ? (
            <div className="text-center py-10 text-sm text-[color:var(--text-secondary)]">No attendance data for this month</div>
          ) : (
            <div className="space-y-3 mt-2">
              {attendanceRate.map((dept, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[color:var(--text-primary)] font-medium">{dept.department}</span>
                    <span className="font-bold text-[color:var(--accent-primary)]">{dept.rate}%</span>
                  </div>
                  <div className="h-2 bg-[color:var(--bg-overlay)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${dept.rate}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: dept.rate >= 80 ? 'var(--success)' : dept.rate >= 60 ? 'var(--warning)' : 'var(--danger)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending Queue */}
        <div className="lg:col-span-2 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[color:var(--border-subtle)] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[color:var(--warning)]" />
            <h3 className="font-bold text-[color:var(--text-primary)]">Pending Leave Queue</h3>
            <span className="ml-auto text-xs font-bold text-[color:var(--warning)] bg-[color:var(--warning)]/10 border border-[color:var(--warning)]/20 px-2 py-0.5 rounded-full">{pendingQueue.length}</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
          ) : pendingQueue.length === 0 ? (
            <div className="text-center py-8 text-sm text-[color:var(--text-secondary)]">No pending requests — all clear ✓</div>
          ) : (
            <div className="divide-y divide-[color:var(--border-subtle)]">
              {pendingQueue.map((leave, i) => (
                <motion.div key={leave._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-[color:var(--bg-overlay)]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--accent-primary)]/10 flex items-center justify-center text-[color:var(--accent-primary)] font-bold text-sm flex-shrink-0">
                    {leave.employee?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[color:var(--text-primary)] truncate">{leave.employee?.name}</div>
                    <div className="text-xs text-[color:var(--text-secondary)] capitalize">{leave.leaveType} · {leave.numberOfDays}d · {new Date(leave.startDate).toLocaleDateString('en-GB')}</div>
                  </div>
                  <button onClick={() => handleApprove(leave._id)}
                    className="flex-shrink-0 text-xs px-3 py-1 bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30 rounded-full font-semibold hover:bg-[color:var(--success)]/20 transition-colors">
                    Approve
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Birthdays & Anniversaries */}
        <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[color:var(--border-subtle)] flex items-center gap-2">
            <Cake className="w-4 h-4 text-[color:var(--info)]" />
            <h3 className="font-bold text-[color:var(--text-primary)]">This Month</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
          ) : birthdays.length === 0 ? (
            <div className="text-center py-8 text-sm text-[color:var(--text-secondary)]">No birthdays or anniversaries this month</div>
          ) : (
            <div className="divide-y divide-[color:var(--border-subtle)]">
              {birthdays.slice(0, 7).map((item, i) => (
                <div key={`${item._id}-${item.type}`} className="px-5 py-3 flex items-center gap-3">
                  <div className="text-2xl">{item.type === 'birthday' ? '🎂' : '🏆'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[color:var(--text-primary)] truncate">{item.name}</div>
                    <div className="text-xs text-[color:var(--text-secondary)]">
                      {item.type === 'birthday' ? `Birthday • ${new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : `${item.years}yr Anniversary • ${new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
