import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, CalendarOff, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { PageHeader, StatCard, Card, CardHeader, CardTitle, Badge, EmptyState, Skeleton } from '../../components/ui';

const CHART_COLORS = ['#00C96B', '#8B7CFF', '#FFB020', '#FF4D6A', '#4DFFA8', '#5BA8FF'];

const HRDashboard = () => {
  const [summary, setSummary] = useState({ totalEmployees: 0, pendingLeaves: 0, onLeaveToday: 0 });
  const [leaveTypeDist, setLeaveTypeDist] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [sumRes, ltDist, leavesRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/leave-types'),
          api.get('/leaves/all'),
        ]);
        setSummary(sumRes.data.data);
        setLeaveTypeDist(ltDist.data.data || []);
        setRecentLeaves((leavesRes.data.leaves || []).slice(0, 5));
      } catch {
        console.error('Failed to load HR dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tooltipStyle = { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '12px', boxShadow: 'var(--glass-shadow)' };

  const stats = [
    { icon: Users, label: 'Total employees', value: loading ? '—' : summary.totalEmployees },
    { icon: CheckCircle, label: 'Active today', value: loading ? '—' : (summary.totalEmployees - summary.onLeaveToday) },
    { icon: CalendarOff, label: 'On leave today', value: loading ? '—' : summary.onLeaveToday },
    { icon: Clock, label: 'Pending approvals', value: loading ? '—' : summary.pendingLeaves },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="People operations" title="Human Resources Overview" icon={Users}
        subtitle="Monitor organization health, attendance, and pending requests."
        actions={summary.pendingLeaves > 0 && !loading ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[color:var(--warning)] bg-[color:var(--warning)]/12 px-3 py-1.5 rounded-full animate-pulse-ring">
            <AlertCircle className="w-3.5 h-3.5" /> {summary.pendingLeaves} need action
          </span>
        ) : null} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="min-h-[360px] flex flex-col">
          <CardHeader><CardTitle>Leave type distribution</CardTitle></CardHeader>
          <div className="flex-1 flex items-center justify-center min-h-[260px] p-4">
            {loading ? <Skeleton className="w-44 h-44 rounded-full" />
              : leaveTypeDist.length === 0 ? <EmptyState title="No leave records" />
              : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={leaveTypeDist} cx="50%" cy="50%" innerRadius={62} outerRadius={96} dataKey="value" nameKey="name" paddingAngle={3}>
                      {leaveTypeDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} days`]} />
                    <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'capitalize' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </div>
        </Card>

        <Card className="min-h-[360px]">
          <CardHeader><CardTitle>Recent leave requests</CardTitle></CardHeader>
          <div className="p-4 pt-0 space-y-2">
            {loading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)
              : recentLeaves.length === 0 ? <EmptyState title="No recent activity" />
              : recentLeaves.map((leave, i) => (
                <motion.div key={leave._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-overlay/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent font-bold text-sm shrink-0">{leave.employee?.name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-content font-medium truncate"><span className="font-semibold">{leave.employee?.name}</span> · {leave.leaveType} leave</p>
                    <p className="text-xs text-content-secondary truncate">{leave.numberOfDays} days · {leave.reason}</p>
                  </div>
                  <Badge status={leave.status} />
                </motion.div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
