import { useState, useEffect } from 'react';
import { CalendarRange, FileText } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Modal } from '../ui';
import Button from '../ui/Button';

const field = 'w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors';

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess, managers }) => {
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '', isHalfDay: false, halfDayType: 'first_half',
    startDate: new Date(), endDate: new Date(), startTime: '09:00', endTime: '18:00',
    reason: '', applyTo: managers.length > 0 ? managers[0]._id : '',
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/leave-types?active=true')
        .then((r) => {
          const types = r.data.leaveTypes || [];
          setLeaveTypes(types);
          if (types.length > 0 && !formData.leaveType) setFormData((f) => ({ ...f, leaveType: types[0].code }));
        })
        .catch(() => toast.error('Failed to load leave types from server'));
    }
  }, [isOpen]);

  const getDaysCount = () => {
    if (formData.isHalfDay) return 0.5;
    const start = new Date(formData.startDate); const end = new Date(formData.endDate);
    start.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0);
    let diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const [sH, sM] = formData.startTime.split(':').map(Number);
    const [eH, eM] = formData.endTime.split(':').map(Number);
    const hoursDiff = ((eH * 60 + eM) - (sH * 60 + sM)) / 60;
    if (diffDays === 0) { if (hoursDiff <= 0) return 0; return Number(Math.min(hoursDiff / 9, 1).toFixed(2)); }
    return Number(Math.max(diffDays + hoursDiff / 9, 0).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startObj = new Date(formData.startDate); const endObj = new Date(formData.endDate);
      startObj.setHours(0, 0, 0, 0); endObj.setHours(0, 0, 0, 0);
      if (endObj.getTime() < startObj.getTime()) { toast.error('End date cannot be earlier than start date'); setLoading(false); return; }
      if (endObj.getTime() === startObj.getTime() && !formData.isHalfDay) {
        const [sH, sM] = formData.startTime.split(':').map(Number);
        const [eH, eM] = formData.endTime.split(':').map(Number);
        if (eH * 60 + eM <= sH * 60 + sM) { toast.error('End time must be after start time on the same date'); setLoading(false); return; }
      }
      const payload = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.isHalfDay ? formData.startDate.toISOString() : formData.endDate.toISOString(),
        numberOfDays: getDaysCount(),
      };
      delete payload.applyTo;
      await api.post('/leaves/apply', payload);
      toast.success('Leave application submitted successfully!');
      onSuccess(); onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply leave" icon={CalendarRange} size="lg"
      footer={<>
        <Button variant="outline" className="ml-auto" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" form="apply-leave-form" loading={loading}>Submit request</Button>
      </>}>
      <form id="apply-leave-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Leave type <span className="text-[color:var(--danger)]">*</span></label>
          {leaveTypes.length === 0 ? (
            <div className="shimmer h-10 rounded-[var(--radius-sm)]" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {leaveTypes.map((lt) => (
                <label key={lt.code} className={`cursor-pointer border py-2.5 px-3 rounded-[var(--radius-sm)] text-sm text-center capitalize transition-all ${formData.leaveType === lt.code ? 'border-accent bg-[color:var(--accent-glow)] text-content font-medium' : 'border-line text-content-secondary hover:border-content-tertiary'}`}>
                  <input type="radio" name="leaveType" value={lt.code} checked={formData.leaveType === lt.code} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })} className="hidden" />
                  {lt.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 p-3 bg-overlay rounded-[var(--radius-sm)]">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-content">
            <input type="checkbox" checked={formData.isHalfDay} onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })} className="accent-[color:var(--accent-primary)] w-4 h-4" />
            Request half day
          </label>
          {formData.isHalfDay && (
            <select value={formData.halfDayType} onChange={(e) => setFormData({ ...formData, halfDayType: e.target.value })} className="bg-base border border-line text-xs rounded px-2 py-1.5 text-content">
              <option value="first_half">First half</option>
              <option value="second_half">Second half</option>
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">From <span className="text-[color:var(--danger)]">*</span></label>
            <div className="flex gap-2">
              <input type="date" value={formData.startDate.toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })} className={field} required />
              {!formData.isHalfDay && <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-24 bg-base border border-line text-content rounded-[var(--radius-sm)] px-2 py-2.5 text-sm focus:outline-none focus:border-accent" required />}
            </div>
          </div>
          {!formData.isHalfDay && (
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-2">To <span className="text-[color:var(--danger)]">*</span></label>
              <div className="flex gap-2">
                <input type="date" value={formData.endDate.toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })} className={field} required />
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-24 bg-base border border-line text-content rounded-[var(--radius-sm)] px-2 py-2.5 text-sm focus:outline-none focus:border-accent" required />
              </div>
            </div>
          )}
        </div>

        <div className="bg-base border border-dashed border-line p-4 rounded-[var(--radius-sm)] flex justify-between items-center">
          <span className="text-sm text-content-secondary">Total days requested</span>
          <span className="font-display font-bold text-xl text-accent tabular-nums">{getDaysCount()}</span>
        </div>

        <div>
          <label className="text-sm font-medium text-content-secondary mb-2 flex items-center justify-between">
            <span>Reason <span className="text-[color:var(--danger)]">*</span></span>
            <span className="text-xs text-content-tertiary tabular-nums">{formData.reason.length}/500</span>
          </label>
          <div className="relative">
            <FileText className="absolute top-3 left-3 w-4 h-4 text-content-tertiary" />
            <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value.substring(0, 500) })} required rows={3}
              className="w-full bg-base border border-line text-content rounded-[var(--radius-sm)] pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 resize-none text-sm" placeholder="Provide a brief reason…" />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
