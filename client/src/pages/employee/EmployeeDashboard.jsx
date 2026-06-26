import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Clock, Plane, HeartPulse, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';
import { StatCard, Card, CardHeader, CardTitle, Badge, EmptyState, Skeleton } from '../../components/ui';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [balRes, leavesRes, typesRes] = await Promise.all([
          api.get('/leaves/balance'),
          api.get('/leaves/my'),
          api.get('/leave-types?active=true'),
        ]);
        setBalance(balRes.data.balance);
        setRecentLeaves((leavesRes.data.leaves || []).slice(0, 5));
        setLeaveTypes(typesRes.data.leaveTypes || []);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const pendingCount = recentLeaves.filter((l) => l.status === 'pending').length;

  const balanceItems = leaveTypes
    .map((lt) => ({
      name: lt.name,
      code: lt.code,
      color: lt.color || 'var(--accent-primary)',
      max: lt.maxDaysPerYear,
      remaining: balance?.[lt.code] ?? lt.maxDaysPerYear,
    }))
    .filter((b) => b.max > 0);

  const stats = [
    { icon: CalendarRange, label: 'Casual balance', value: loading ? '—' : (balance?.casual ?? '—'), suffix: loading ? '' : ' days' },
    { icon: Plane, label: 'Annual balance', value: loading ? '—' : (balance?.annual ?? '—'), suffix: loading ? '' : ' days' },
    { icon: Clock, label: 'Pending requests', value: loading ? '—' : pendingCount },
    { icon: HeartPulse, label: 'Sick balance', value: loading ? '—' : (balance?.sick ?? '—'), suffix: loading ? '' : ' days' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          {greeting()}, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="text-content-secondary text-sm mt-1.5">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.07} />
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Balance breakdown */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarRange className="w-4 h-4 text-accent" /> Leave balance breakdown</CardTitle>
          </CardHeader>
          <div className="p-5 pt-1">
            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : balanceItems.length === 0 ? (
              <p className="text-sm text-content-secondary py-4">No leave policy configured yet.</p>
            ) : (
              <div className="space-y-5">
                {balanceItems.map((item, i) => {
                  const pct = item.max > 0 ? (item.remaining / item.max) * 100 : 0;
                  return (
                    <motion.div key={item.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-content">{item.name}</span>
                        <span className="font-semibold tabular-nums" style={{ color: item.color }}>{item.remaining} / {item.max} days</span>
                      </div>
                      <div className="h-2.5 bg-overlay rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, color-mix(in srgb, ${item.color} 60%, white))` }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Recent leaves */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent requests</CardTitle>
            <Link to="/dashboard/employee/leaves" className="text-xs text-accent font-semibold hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          {loading ? (
            <div className="p-5 pt-0 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : recentLeaves.length === 0 ? (
            <EmptyState icon={CalendarRange} title="No requests yet"
              description="When you apply for leave, it will appear here."
              action={<Link to="/dashboard/employee/leaves" className="text-accent font-semibold text-sm hover:underline">Apply your first leave →</Link>} />
          ) : (
            <div className="divide-y divide-line/60">
              {recentLeaves.map((leave, i) => (
                <motion.div key={leave._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-overlay/40 transition-colors">
                  <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[color:var(--accent-glow)] grid place-items-center text-accent shrink-0">
                    <CalendarRange className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-content capitalize truncate">{leave.leaveType} leave</div>
                    <div className="text-xs text-content-secondary">
                      {new Date(leave.startDate).toLocaleDateString('en-GB')} – {new Date(leave.endDate).toLocaleDateString('en-GB')} · {leave.numberOfDays}d
                    </div>
                  </div>
                  <Badge status={leave.status} />
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
