import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Plus, Plane, Gift, MinusCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import ApplyLeaveModal from '../../components/leaves/ApplyLeaveModal';
import { toast } from 'sonner';
import { PageHeader, StatCard, Card, Badge, EmptyState, Button, ResponsiveTable } from '../../components/ui';

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

  const d = (v) => new Date(v).toLocaleDateString('en-GB');
  const columns = [
    { key: 'type', header: 'Type', mobile: 'title', render: (r) => <span className="capitalize">{r.leaveType}</span> },
    { key: 'from', header: 'From', tdClass: 'text-content-secondary tabular-nums', render: (r) => d(r.startDate) },
    { key: 'to', header: 'To', tdClass: 'text-content-secondary tabular-nums', render: (r) => d(r.endDate) },
    { key: 'days', header: 'Days', tdClass: 'font-semibold tabular-nums', render: (r) => r.numberOfDays },
    { key: 'status', header: 'Status', mobile: 'trailing', render: (r) => <Badge status={r.status} /> },
    { key: 'reason', header: 'Reason', tdClass: 'text-content-secondary max-w-[200px] truncate', render: (r) => <span title={r.reason}>{r.reason}</span> },
    { key: 'approver', header: 'Approver', tdClass: 'text-content-secondary', render: (r) => r.applyTo?.name || '—' },
  ];

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
        <ResponsiveTable
          columns={columns}
          data={leaves}
          loading={loading}
          empty={<EmptyState icon={CalendarRange} title="No leave requests yet" description='Click "Apply leave" to submit your first request.'
            action={<Button size="sm" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Apply leave</Button>} />}
        />
      </Card>

      <ApplyLeaveModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchLeaves} managers={managers} />
    </div>
  );
};

export default EmployeeLeaves;
