import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Plus } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import ApplyLeaveModal from '../../components/leaves/ApplyLeaveModal';
import { toast } from 'sonner';

// Minimal Custom Table based on TanStack Table logic structure
const EmployeeLeaves = () => {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my');
      setLeaves(res.data.leaves);
    } catch (error) {
      toast.error('Failed to fetch your leave history');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/users/managers');
      setManagers(res.data.managers);
    } catch (error) {
      console.error('Failed to load managers');
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchManagers();
  }, []);

  const StatusPill = ({ status }) => {
    const map = {
      pending: 'bg-[color:var(--status-pending)]/10 border-[color:var(--status-pending)]/20 text-[color:var(--status-pending)]',
      approved: 'bg-[color:var(--status-approved)]/10 border-[color:var(--status-approved)]/20 text-[color:var(--status-approved)]',
      rejected: 'bg-[color:var(--status-rejected)]/10 border-[color:var(--status-rejected)]/20 text-[color:var(--status-rejected)]'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status] || map.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Leaves', value: user?.leaveBalance?.casual || 0, color: 'text-[color:var(--success)]' },
          { label: 'Compensatory Balance', value: user?.leaveBalance?.compensatory || 0, color: 'text-[color:var(--info)]' },
          { label: 'Deducted Leaves', value: 0, color: 'text-[color:var(--danger)]' },
          { label: 'Pending Requests', value: leaves.filter(l => l.status === 'pending').length, color: 'text-[color:var(--warning)]' }
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-lg bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] flex flex-col justify-center items-center text-center shadow-sm">
            <span className={`text-3xl font-black mb-2 ${stat.color}`}>{stat.value}</span>
            <span className="text-sm font-medium text-[color:var(--text-secondary)]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[color:var(--bg-surface)] p-4 rounded-lg border border-[color:var(--border-subtle)] shadow-sm">
        <h2 className="text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[color:var(--accent-primary)]" />
          Leave History
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="p-2 border border-[color:var(--border-subtle)] rounded-md text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-overlay)] hover:text-[color:var(--text-primary)] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-md hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-[color:var(--bg-surface)] rounded-lg border border-[color:var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[color:var(--bg-overlay)] border-b border-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Leave Type</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">From</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">To</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Days</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Reason</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)] text-[color:var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[color:var(--text-secondary)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                      Loading history...
                    </div>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[color:var(--text-secondary)]">
                    No leave requests found. Click "Apply Leave" to get started.
                  </td>
                </tr>
              ) : (
                leaves.map((leave, i) => (
                  <motion.tr 
                    key={leave._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[color:var(--bg-overlay)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium capitalize">{leave.leaveType}</td>
                    <td className="px-6 py-4">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 font-bold">{leave.numberOfDays}</td>
                    <td className="px-6 py-4"><StatusPill status={leave.status} /></td>
                    <td className="px-6 py-4 text-[color:var(--text-secondary)] max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-6 py-4">{leave.applyTo?.name || 'Unknown'}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApplyLeaveModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchLeaves} 
        managers={managers} 
      />
    </div>
  );
};

export default EmployeeLeaves;
