import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';

const CHART_COLORS = ['#008A4A', '#7B61FF', '#FFAA00', '#FF4466', '#00C9FF', '#00FF87'];

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
          api.get('/leaves/all')
        ]);
        setSummary(sumRes.data.data);
        setLeaveTypeDist(ltDist.data.data || []);
        // Display latest 5 leave requests in activity feed
        setRecentLeaves((leavesRes.data.leaves || []).slice(0, 5));
      } catch (error) {
        console.error('Failed to load HR dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, highlight }) => (
    <div className={`p-6 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] flex flex-col justify-between shadow-sm relative overflow-hidden group ${highlight ? 'ring-1 ring-[color:var(--warning)]' : ''}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[color:var(--text-secondary)] mb-1 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-black text-[color:var(--text-primary)]">{loading ? '—' : value}</p>
      </div>
      {highlight && value > 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-[color:var(--warning)] bg-[color:var(--warning)]/10 px-3 py-1 rounded-full animate-pulse">
          <AlertCircle className="w-3 h-3" /> ACTION REQUIRED
        </div>
      )}
    </div>
  );

  const tooltipStyle = { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[color:var(--sidebar-bg)] to-[color:var(--bg-overlay)] rounded-xl border border-[color:var(--border-subtle)] overflow-hidden relative">
        <div className="z-10">
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)] mb-1">Human Resources Overview</h1>
          <p className="text-[color:var(--text-secondary)]">Monitor organization health, attendance, and pending requests.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-20 pointer-events-none w-1/3">
          <div className="absolute inset-0 bg-gradient-to-l from-[color:var(--accent-primary)] to-transparent blur-3xl"></div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={summary.totalEmployees} icon={Users} colorClass="bg-[color:var(--info)]/20 text-[color:var(--info)]" />
        <StatCard title="Active Today" value={summary.totalEmployees - summary.onLeaveToday} icon={CheckCircle} colorClass="bg-[color:var(--success)]/20 text-[color:var(--success)]" />
        <StatCard title="On Leave Today" value={summary.onLeaveToday} icon={BarChart3} colorClass="bg-[color:var(--text-secondary)]/20 text-[color:var(--text-primary)]" />
        <StatCard title="Pending Approvals" value={summary.pendingLeaves} icon={Clock} colorClass="bg-[color:var(--warning)]/20 text-[color:var(--warning)]" highlight={true} />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-6 min-h-[350px] shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-[color:var(--text-primary)]">Leave Type Distribution</h3>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {loading ? (
              <div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            ) : leaveTypeDist.length === 0 ? (
              <span className="text-[color:var(--text-secondary)] text-sm">No leave records</span>
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
          </div>
        </div>
        
        <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-6 min-h-[350px] shadow-sm">
          <h3 className="font-bold text-lg mb-6 text-[color:var(--text-primary)]">Recent Leave Requests</h3>
          <div className="space-y-4">
            {loading ? (
               <div className="flex justify-center"><div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
            ) : recentLeaves.length === 0 ? (
               <div className="text-[color:var(--text-secondary)] text-sm text-center">No recent activity</div>
            ) : recentLeaves.map(leave => (
              <div key={leave._id} className="flex items-start gap-4 p-3 hover:bg-[color:var(--bg-overlay)] rounded-lg transition-colors border border-[color:var(--border-subtle)]/50">
                <div className={`min-w-[10px] min-h-[10px] w-2.5 h-2.5 rounded-full mt-1.5 whitespace-nowrap ${leave.status === 'pending' ? 'bg-[color:var(--warning)]' : leave.status === 'approved' ? 'bg-[color:var(--success)]' : 'bg-[color:var(--danger)]'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[color:var(--text-primary)] font-medium truncate">{leave.employee?.name} requested {leave.leaveType} leave</p>
                  <p className="text-xs text-[color:var(--text-secondary)] truncate">For {leave.numberOfDays} days • {leave.reason}</p>
                </div>
                <span className="text-xs text-[color:var(--text-secondary)] ml-auto whitespace-nowrap capitalize px-2 py-0.5 rounded bg-[color:var(--bg-overlay)]">{leave.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
