import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Plus, Plane, Gift, MinusCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import ApplyLeaveModal from '../../components/leaves/ApplyLeaveModal';
import { toast } from 'sonner';
import { PageHeader, StatCard, Card, Badge, EmptyState, Button, Skeleton } from '../../components/ui';

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
    } catch {
      toast.error('Failed to fetch your leave history');
    } finally {
      setLoading(false);
    }
  };
  const fetchManagers = async () => {
    try {
      const res = await api.get('/users/managers');
      setManagers(res.data.managers);
    } catch {
      console.error('Failed to load managers');
    }
  };
  useEffect(() => { fetchLeaves(); fetchManagers(); }, []);

  const stats = [
    { icon: Plane, label: 'Available leaves', value: user?.leaveBalance?.casual || 0 },
    { icon: Gift, label: 'Compensatory', value: user?.leaveBalance?.compensatory || 0 },
    { icon: MinusCircle, label: 'Deducted', value: 0 },
    { icon: Clock, label: 'Pending', value: leaves.filter((l) => l.status === 'pending').length },
  ];

  const cols = ['Type', 'From', 'To', 'Days', 'Status', 'Reason', 'Approver'];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="My time off"
        title="Leaves"
        icon={CalendarRange}
        subtitle="Apply for leave and track the status of every request in one place."
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Apply leave</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      <Card variant="glass" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-line/60 flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-accent" />
          <h2 className="font-display font-semibold text-content">Leave history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-content-tertiary border-b border-line/60">
                {cols.map((c) => <th key={c} className="px-5 py-3 font-semibold text-[11px] tracking-wider uppercase">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-b border-line/40"><td colSpan={7} className="px-5 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                ))
              ) : leaves.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={CalendarRange} title="No leave requests yet" description='Click "Apply leave" to submit your first request.'
                  action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Apply leave</Button>} /></td></tr>
              ) : (
                leaves.map((leave, i) => (
                  <motion.tr key={leave._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-line/40 last:border-0 hover:bg-overlay/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium capitalize text-content">{leave.leaveType}</td>
                    <td className="px-5 py-3.5 text-content-secondary tabular-nums">{new Date(leave.startDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 text-content-secondary tabular-nums">{new Date(leave.endDate).toLocaleDateString('en-GB')}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums">{leave.numberOfDays}</td>
                    <td className="px-5 py-3.5"><Badge status={leave.status} /></td>
                    <td className="px-5 py-3.5 text-content-secondary max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-5 py-3.5 text-content-secondary">{leave.applyTo?.name || '—'}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ApplyLeaveModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchLeaves} managers={managers} />
    </div>
  );
};

export default EmployeeLeaves;
