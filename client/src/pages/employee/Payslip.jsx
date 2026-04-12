import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../hooks/useAuthStore';
import { toast } from 'sonner';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
        if (error.response?.status === 404) {
          setPayslips([]); // endpoint not yet implemented
        } else {
          toast.error('Failed to load payslips');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchPayslips();
  }, [user, selectedMonth, selectedYear]);

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  // Demo payslip structure when no real API exists
  const demoPayslip = {
    month: MONTHS[selectedMonth],
    year: selectedYear,
    grossPay: 75000,
    netPay: 61200,
    deductions: { pf: 9000, tax: 3800, insurance: 1000 },
    earnings: { basic: 45000, hra: 18000, allowances: 12000 }
  };

  const payslip = payslips[0] || (loading ? null : demoPayslip);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Payslips</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">View and download your monthly payslips</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <button onClick={prevMonth} className="p-2 hover:bg-[color:var(--bg-overlay)] rounded-lg transition-colors text-[color:var(--text-secondary)]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-[color:var(--text-primary)]">{MONTHS[selectedMonth]} {selectedYear}</div>
          <div className="text-xs text-[color:var(--text-secondary)]">Payslip Period</div>
        </div>
        <button onClick={nextMonth} className="p-2 hover:bg-[color:var(--bg-overlay)] rounded-lg transition-colors text-[color:var(--text-secondary)]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payslip ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Gross Pay', value: `₹${(payslip.grossPay || 0).toLocaleString('en-IN')}`, color: 'text-[color:var(--info)]' },
              { label: 'Total Deductions', value: `₹${Object.values(payslip.deductions || {}).reduce((a, b) => a + b, 0).toLocaleString('en-IN')}`, color: 'text-[color:var(--danger)]' },
              { label: 'Net Pay', value: `₹${(payslip.netPay || 0).toLocaleString('en-IN')}`, color: 'text-[color:var(--success)]' },
            ].map((s, i) => (
              <div key={i} className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl p-5 text-center shadow-sm">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-sm text-[color:var(--text-secondary)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Earnings vs Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-[color:var(--border-subtle)] font-semibold text-[color:var(--text-primary)] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[color:var(--success)]" /> Earnings
              </div>
              <div className="divide-y divide-[color:var(--border-subtle)]">
                {Object.entries(payslip.earnings || {}).map(([k, v]) => (
                  <div key={k} className="px-5 py-3 flex justify-between text-sm">
                    <span className="text-[color:var(--text-secondary)] capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">₹{v.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-[color:var(--border-subtle)] font-semibold text-[color:var(--text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[color:var(--danger)]" /> Deductions
              </div>
              <div className="divide-y divide-[color:var(--border-subtle)]">
                {Object.entries(payslip.deductions || {}).map(([k, v]) => (
                  <div key={k} className="px-5 py-3 flex justify-between text-sm">
                    <span className="text-[color:var(--text-secondary)] uppercase text-xs font-medium">{k}</span>
                    <span className="font-semibold text-[color:var(--danger)]">-₹{v.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-[color:var(--accent-primary)] text-black font-bold rounded-xl hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </motion.div>
      ) : (
        <div className="text-center py-16 text-[color:var(--text-secondary)]">
          No payslip found for {MONTHS[selectedMonth]} {selectedYear}
        </div>
      )}
    </div>
  );
};

export default Payslip;
