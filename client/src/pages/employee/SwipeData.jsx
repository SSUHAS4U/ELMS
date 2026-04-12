import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Download, Filter } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const SwipeData = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    avgInTime: '00:00',
    avgBreakTime: '0h',
    avgWorkTime: '0h',
    avgOutTime: '00:00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Assuming we build this endpoint or mock it for now based on the controller
        const [recordsRes, statsRes] = await Promise.all([
          api.get('/swipe/my').catch(() => ({ data: { records: [] } })),
          api.get('/swipe/stats').catch(() => ({ data: { stats: {} } }))
        ]);
        
        setRecords(recordsRes.data.records || []);
        if (statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
      } catch (error) {
        toast.error('Failed to load swipe data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatusBadge = ({ status }) => {
    const map = {
      present: 'bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/20',
      wfh: 'bg-[color:var(--info)]/10 text-[color:var(--info)] border-[color:var(--info)]/20',
      lop: 'bg-[color:var(--danger)]/10 text-[color:var(--danger)] border-[color:var(--danger)]/20',
      co: 'bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/20',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status] || 'bg-gray-500/10 text-gray-400'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg In Time', value: stats.avgInTime },
          { label: 'Avg Break', value: stats.avgBreakTime },
          { label: 'Avg Work', value: stats.avgWorkTime },
          { label: 'Avg Out', value: stats.avgOutTime }
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-lg bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] flex flex-col shadow-sm">
            <span className="text-sm font-medium text-[color:var(--text-secondary)] mb-2">{stat.label}</span>
            <span className="text-2xl font-black text-[color:var(--text-primary)]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-[color:var(--bg-surface)] p-4 rounded-lg border border-[color:var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select className="bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]">
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
          </select>
          <button className="p-2 border border-[color:var(--border-subtle)] rounded-md text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-overlay)] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] font-medium rounded-md hover:bg-[color:var(--bg-overlay)] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-md hover:bg-[color:var(--accent-muted)] transition-colors">
            Regularize
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-[color:var(--bg-surface)] rounded-lg border border-[color:var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[color:var(--bg-overlay)] border-b border-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Date</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">In Time</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Out Time</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Work Time</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Break Time</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Reg Hr</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)] text-[color:var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[color:var(--text-secondary)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                      Loading swipe data...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[color:var(--text-secondary)]">
                    No swipe records found for this period.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr 
                    key={record._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[color:var(--bg-overlay)]/50 transition-colors"
                  >
                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">{record.inTime ? new Date(record.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-6 py-4">{record.outTime ? new Date(record.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td className="px-6 py-4 font-medium">{record.workDuration ? `${Math.floor(record.workDuration/60)}h ${record.workDuration%60}m` : '-'}</td>
                    <td className="px-6 py-4 text-[color:var(--text-secondary)]">{record.breakDuration ? `${record.breakDuration}m` : '-'}</td>
                    <td className="px-6 py-4 text-[color:var(--danger)]">{record.regularizeHours || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SwipeData;
