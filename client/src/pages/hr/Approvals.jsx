import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const Approvals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/pending');
      setLeaves(res.data.leaves);
    } catch (error) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/leaves/${id}/${action}`, { approvalNote: `Processed by HR (${action})` });
      toast.success(`Leave ${action}d successfully`);
      // Filter out completed leave
      setLeaves(prev => prev.filter(l => l._id !== id));
    } catch (error) {
      toast.error(`Failed to ${action} leave`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center bg-[color:var(--bg-surface)] p-4 rounded-lg border border-[color:var(--border-subtle)] shadow-sm">
        <h2 className="text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2">
          Pending Approvals
          <span className="bg-[color:var(--warning)] text-black text-xs font-bold px-2 py-0.5 rounded-full">{leaves.length}</span>
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[color:var(--text-secondary)]" />
            <input type="text" placeholder="Search employee..." className="pl-9 pr-4 py-2 text-sm bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] rounded-md focus:outline-none focus:border-[color:var(--accent-primary)] text-[color:var(--text-primary)]" />
          </div>
          <button className="p-2 border border-[color:var(--border-subtle)] rounded-md text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-overlay)] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[color:var(--bg-surface)] rounded-lg border border-[color:var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[color:var(--bg-overlay)] border-b border-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Employee</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Dept</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Type</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">From</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">To</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Days</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase min-w-[200px]">Reason</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)] text-[color:var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[color:var(--text-secondary)]">Loading pending queue...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[color:var(--text-secondary)]">All caught up! No pending approvals.</td>
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
                    <td className="px-6 py-4 font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] flex items-center justify-center text-xs">
                        {leave.employee?.name?.charAt(0)}
                      </div>
                      {leave.employee?.name}
                    </td>
                    <td className="px-6 py-4">{leave.employee?.department?.name || 'ENG'}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-[color:var(--info)]">{leave.leaveType}</td>
                    <td className="px-6 py-4">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 font-black">{leave.numberOfDays}</td>
                    <td className="px-6 py-4 text-[color:var(--text-secondary)] max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(leave._id, 'approve')} className="flex items-center justify-center w-8 h-8 rounded text-[color:var(--success)] bg-[color:var(--success)]/10 hover:bg-[color:var(--success)] hover:text-black transition-colors" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(leave._id, 'reject')} className="flex items-center justify-center w-8 h-8 rounded text-[color:var(--danger)] bg-[color:var(--danger)]/10 hover:bg-[color:var(--danger)] hover:text-black transition-colors" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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

export default Approvals;
