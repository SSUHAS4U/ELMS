import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ChevronLeft, ChevronRight, Wallet, TrendingDown, Coins } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';
import { PageHeader, Card, Button, EmptyState, Skeleton } from '../../components/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const inr = (v) => `₹${(v || 0).toLocaleString('en-IN')}`;

const Payslip = () => {
  const { user } = useAuthStore();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/payslips/${user._id}?month=${selectedMonth + 1}&year=${selectedYear}`);
        setPayslips(res.data.payslips || []);
      } catch (error) {
        if (error.response?.status === 404) setPayslips([]);
        else toast.error('Failed to load payslips');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchPayslips();
  }, [user, selectedMonth, selectedYear]);

  const prevMonth = () => { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); } else setSelectedMonth((m) => m - 1); };
  const nextMonth = () => { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); } else setSelectedMonth((m) => m + 1); };

  const demoPayslip = {
    month: MONTHS[selectedMonth], year: selectedYear, grossPay: 75000, netPay: 61200,
    deductions: { pf: 9000, tax: 3800, insurance: 1000 }, earnings: { basic: 45000, hra: 18000, allowances: 12000 },
  };
  const payslip = payslips[0] || (loading ? null : demoPayslip);
  const totalDeductions = Object.values(payslip?.deductions || {}).reduce((a, b) => a + b, 0);

  const summary = [
    { icon: Coins, label: 'Gross pay', value: inr(payslip?.grossPay), color: 'var(--info)' },
    { icon: TrendingDown, label: 'Total deductions', value: inr(totalDeductions), color: 'var(--danger)' },
    { icon: Wallet, label: 'Net pay', value: inr(payslip?.netPay), color: 'var(--success)' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Compensation" title="Payslips" icon={Wallet} subtitle="View and download your monthly payslips." />

      <Card className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month"><ChevronLeft className="w-5 h-5" /></Button>
        <div className="text-center">
          <div className="font-display text-lg font-bold text-content">{MONTHS[selectedMonth]} {selectedYear}</div>
          <div className="text-xs text-content-secondary uppercase tracking-wider">Payslip period</div>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month"><ChevronRight className="w-5 h-5" /></Button>
      </Card>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : payslip ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summary.map((s) => (
              <Card key={s.label} hover className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[var(--radius-sm)] grid place-items-center" style={{ background: `color-mix(in srgb, ${s.color} 14%, transparent)`, color: s.color }}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-content-secondary">{s.label}</span>
                </div>
                <div className="font-display text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <div className="px-5 py-3.5 border-b border-line/60 font-display font-semibold text-content flex items-center gap-2"><Wallet className="w-4 h-4 text-[color:var(--success)]" /> Earnings</div>
              <div className="divide-y divide-line/60">
                {Object.entries(payslip.earnings || {}).map(([k, v]) => (
                  <div key={k} className="px-5 py-3 flex justify-between text-sm">
                    <span className="text-content-secondary capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-content tabular-nums">{inr(v)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="px-5 py-3.5 border-b border-line/60 font-display font-semibold text-content flex items-center gap-2"><FileText className="w-4 h-4 text-[color:var(--danger)]" /> Deductions</div>
              <div className="divide-y divide-line/60">
                {Object.entries(payslip.deductions || {}).map(([k, v]) => (
                  <div key={k} className="px-5 py-3 flex justify-between text-sm">
                    <span className="text-content-secondary uppercase text-xs font-medium">{k}</span>
                    <span className="font-semibold text-[color:var(--danger)] tabular-nums">-{inr(v)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Button><Download className="w-4 h-4" /> Download PDF</Button>
        </motion.div>
      ) : (
        <EmptyState icon={Wallet} title="No payslip found" description={`Nothing for ${MONTHS[selectedMonth]} ${selectedYear}.`} />
      )}
    </div>
  );
};

export default Payslip;
