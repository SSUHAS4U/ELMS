import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, PieChart as PieIcon, BarChart3, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const COLORS = ['#7B61FF', '#00FF87', '#00D1FF', '#FFB800', '#FF4E4E'];

const EmployeeMonitoringDetails = ({ employeeId, employeeName }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/analytics/employee-stats/${employeeId}`);
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch employee stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [employeeId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-[color:var(--text-secondary)] font-medium">Analyzing organizational data...</span>
    </div>
  );

  if (stats.length === 0) return (
    <div className="flex flex-col items-center justify-center py-10 opacity-50">
      <AlertCircle className="w-8 h-8 mb-2" />
      <p className="text-sm">No leave metrics available for this cycle</p>
    </div>
  );

  return (
    <div className="p-6 bg-[color:var(--bg-base)]/40 rounded-xl border border-[color:var(--border-subtle)]/50 backdrop-blur-sm shadow-inner">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[color:var(--accent-primary)]" />
            Performance & Attendance Analytics: {employeeName}
          </h3>
          <p className="text-xs text-[color:var(--text-secondary)] mt-1 tracking-wide">Detailed leave distribution for current fiscal year</p>
        </div>
        
        <div className="flex bg-[color:var(--bg-overlay)] p-1 rounded-lg border border-[color:var(--border-subtle)]">
          <button 
            onClick={() => setActiveTab('bar')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'bar' ? 'bg-[color:var(--accent-primary)] text-white shadow-lg' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Utilization
          </button>
          <button 
            onClick={() => setActiveTab('pie')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'pie' ? 'bg-[color:var(--accent-primary)] text-white shadow-lg' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}`}
          >
            <PieIcon className="w-3.5 h-3.5" /> Distribution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Metric Cards */}
        <div className="lg:col-span-1 space-y-4">
          {stats.map((item, idx) => (
            <motion.div 
              key={item.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[color:var(--bg-surface)] p-4 rounded-xl border border-[color:var(--border-subtle)] shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <div className="text-[10px] uppercase font-bold tracking-widest text-[color:var(--text-secondary)] mb-1">{item.type}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-[color:var(--text-primary)] tracking-tight">{item.remaining}</span>
                <span className="text-[10px] text-[color:var(--text-secondary)]">DAYS LEFT</span>
              </div>
              <div className="mt-2 w-full bg-[color:var(--bg-base)] h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.used / (item.used + item.remaining || 1)) * 100}%` }}
                  className="h-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-bold text-[color:var(--text-secondary)]">
                <span>USED: {item.used}</span>
                <span>TOTAL: {item.used + item.remaining}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart View */}
        <div className="lg:col-span-3 h-[320px] bg-[color:var(--bg-surface)] p-6 rounded-2xl border border-[color:var(--border-subtle)] shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--accent-primary)]/5 to-transparent pointer-events-none" />
          <AnimatePresence mode="wait">
            {activeTab === 'bar' ? (
              <motion.div 
                key="bar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="type" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8888A0', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8888A0', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111114', borderRadius: '12px', border: '1px solid #1F1F24', fontSize: '12px', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    <Bar dataKey="used" name="Days Used" fill="#7B61FF" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="remaining" name="Remaining Balance" fill="#00FF87" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div 
                key="pie"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="used"
                      nameKey="type"
                      stroke="none"
                    >
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111114', borderRadius: '12px', border: '1px solid #1F1F24', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-[10px] text-[color:var(--text-secondary)] font-bold uppercase tracking-widest">Global</div>
                  <div className="text-2xl font-black text-[color:var(--text-primary)]">USAGE</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonitoringDetails;
