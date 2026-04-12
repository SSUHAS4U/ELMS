import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Clock, TrendingDown, AlertCircle, Users } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';

const STATUS_COLORS = {
  pending:  'text-[color:var(--status-pending)] bg-[color:var(--status-pending)]/10',
  approved: 'text-[color:var(--status-approved)] bg-[color:var(--status-approved)]/10',
  rejected: 'text-[color:var(--status-rejected)] bg-[color:var(--status-rejected)]/10',
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
          api.get('/leave-types?active=true')
        ]);
        setBalance(balRes.data.balance);
        setRecentLeaves((leavesRes.data.leaves || []).slice(0, 5));
        setLeaveTypes(typesRes.data.leaveTypes || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const pendingCount = recentLeaves.filter(l => l.status === 'pending').length;
  const approvedThisYear = recentLeaves.filter(l => l.status === 'approved').length;

  // Build balance display from leaveTypes + user balance object
  const balanceItems = leaveTypes.map(lt => ({
    name: lt.name,
    code: lt.code,
    color: lt.color,
    max: lt.maxDaysPerYear,
    used: lt.maxDaysPerYear - (balance?.[lt.code] ?? lt.maxDaysPerYear),
    remaining: balance?.[lt.code] ?? lt.maxDaysPerYear
  })).filter(b => b.max > 0); // skip LOP style (unlimited)

  const statCards = [
    {
      label: 'Casual Balance',
      value: loading ? '—' : (balance?.casual ?? '—'),
      color: 'text-[color:var(--success)]',
      bg: 'bg-[color:var(--success)]/10',
      icon: CalendarRange
    },
    {
      label: 'Annual Balance',
      value: loading ? '—' : (balance?.annual ?? '—'),
      color: 'text-[color:var(--info)]',
      bg: 'bg-[color:var(--info)]/10',
      icon: TrendingDown
    },
    {
      label: 'Pending Requests',
      value: loading ? '—' : pendingCount,
      color: 'text-[color:var(--warning)]',
      bg: 'bg-[color:var(--warning)]/10',
      icon: Clock
    },
    {
      label: 'Sick Balance',
      value: loading ? '—' : (balance?.sick ?? '—'),
      color: 'text-[color:var(--danger)]',
      bg: 'bg-[color:var(--danger)]/10',
      icon: AlertCircle
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">
          Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-[color:var(--text-secondary)] text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="p-5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] shadow-sm relative overflow-hidden">
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-full ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className={`text-3xl font-black mb-1 ${card.color}`}>{card.value}</div>
            <div className="text-xs font-medium text-[color:var(--text-secondary)]">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Leave Balance Breakdown */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-[color:var(--accent-primary)]" />
          Leave Balance Breakdown
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-8 bg-[color:var(--bg-overlay)] rounded animate-pulse" />)}
          </div>
        ) : balanceItems.length === 0 ? (
          <p className="text-sm text-[color:var(--text-secondary)]">No leave policy configured yet</p>
        ) : (
          <div className="space-y-4">
            {balanceItems.map((item, i) => (
              <motion.div key={item.code}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[color:var(--text-primary)] font-medium">{item.name}</span>
                  <span className="font-bold" style={{ color: item.color }}>
                    {item.remaining} / {item.max} days
                  </span>
                </div>
                <div className="h-2 bg-[color:var(--bg-overlay)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.max > 0 ? (item.remaining / item.max) * 100 : 0}%` }}
                    transition={{ duration: 0.7, delay: 0.4 + i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Leave History */}
      <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[color:var(--border-subtle)] flex items-center justify-between">
          <h2 className="font-bold text-[color:var(--text-primary)]">Recent Leave Requests</h2>
          <a href="/dashboard/employee/leaves" className="text-xs text-[color:var(--accent-primary)] font-semibold hover:underline">View all →</a>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
        ) : recentLeaves.length === 0 ? (
          <div className="text-center py-10 text-[color:var(--text-secondary)] text-sm">
            No leave requests yet. <a href="/dashboard/employee/leaves" className="text-[color:var(--accent-primary)] font-semibold">Apply your first leave →</a>
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border-subtle)]">
            {recentLeaves.map((leave, i) => (
              <motion.div key={leave._id}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-[color:var(--bg-overlay)]/40 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[color:var(--accent-primary)]/10 flex items-center justify-center">
                  <CalendarRange className="w-5 h-5 text-[color:var(--accent-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[color:var(--text-primary)] capitalize">{leave.leaveType} Leave</div>
                  <div className="text-xs text-[color:var(--text-secondary)]">
                    {new Date(leave.startDate).toLocaleDateString('en-GB')} – {new Date(leave.endDate).toLocaleDateString('en-GB')} · {leave.numberOfDays} day{leave.numberOfDays !== 1 ? 's' : ''}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[leave.status]}`}>
                  {leave.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
