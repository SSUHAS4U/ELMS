import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import api from '../../lib/api';
import { EmptyState, Skeleton } from '../ui';

const COLORS = ['#8B7CFF', '#00C96B', '#5BA8FF', '#FFB020', '#FF4D6A'];
const tooltipStyle = { backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', boxShadow: 'var(--glass-shadow)' };
const tick = { fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 };

const EmployeeMonitoringDetails = ({ employeeId, employeeName }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/analytics/employee-stats/${employeeId}`);
        setStats(res.data.data);
      } catch {
        console.error('Failed to fetch employee stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [employeeId]);

  if (loading) return <div className="grid lg:grid-cols-4 gap-6"><Skeleton className="h-64 lg:col-span-1" /><Skeleton className="h-64 lg:col-span-3" /></div>;
  if (stats.length === 0) return <EmptyState icon={TrendingUp} title="No leave metrics" description="No data available for this cycle." className="py-10" />;

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-content flex items-center gap-2"><TrendingUp className="w-5 h-5 text-accent" /> Analytics · {employeeName}</h3>
          <p className="text-xs text-content-secondary mt-1">Leave distribution for the current fiscal year.</p>
        </div>
        <div className="flex bg-overlay p-1 rounded-[var(--radius-sm)] border border-line">
          {[['bar', BarChart3, 'Utilization'], ['pie', PieIcon, 'Distribution']].map(([key, Icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-sm)-2px)] text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === key ? 'bg-accent text-[color:var(--accent-contrast)] shadow-sm' : 'text-content-secondary hover:text-content'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {stats.map((item, idx) => {
            const total = item.used + item.remaining || 1;
            return (
              <motion.div key={item.type} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                className="card-surface p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <div className="text-[10px] uppercase font-bold tracking-widest text-content-tertiary mb-1">{item.type}</div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-xl font-bold text-content tabular-nums">{item.remaining}</span>
                  <span className="text-[10px] text-content-secondary">DAYS LEFT</span>
                </div>
                <div className="mt-2 w-full bg-base h-1.5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item.used / total) * 100}%` }} className="h-full rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[9px] font-bold text-content-tertiary"><span>USED {item.used}</span><span>TOTAL {total}</span></div>
              </motion.div>
            );
          })}
        </div>

        <div className="lg:col-span-3 h-[320px] card-surface p-6 relative overflow-hidden">
          {activeTab === 'bar' ? (
            <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
              <ResponsiveContainer width="99%" height="100%" minHeight={280}>
                <BarChart data={stats} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={tick} />
                  <YAxis axisLine={false} tickLine={false} tick={tick} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-overlay)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 16, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                  <Bar dataKey="used" name="Days used" fill="#8B7CFF" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="remaining" name="Remaining" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div key="pie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
              <ResponsiveContainer width="99%" height="100%" minHeight={280}>
                <PieChart>
                  <Pie data={stats} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="used" nameKey="type" stroke="none">
                    {stats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Global</div>
                <div className="font-display text-2xl font-bold text-content">USAGE</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonitoringDetails;
