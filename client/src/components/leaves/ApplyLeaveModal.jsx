import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, FileText } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess, managers }) => {
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    isHalfDay: false,
    halfDayType: 'first_half',
    startDate: new Date(),
    endDate: new Date(),
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
    applyTo: managers.length > 0 ? managers[0]._id : ''
  });

  // Fetch leave types from API — spec rule: never hardcode leave types in frontend
  useEffect(() => {
    if (isOpen) {
      api.get('/leave-types?active=true')
        .then(r => {
          const types = r.data.leaveTypes || [];
          setLeaveTypes(types);
          if (types.length > 0 && !formData.leaveType) {
            setFormData(f => ({ ...f, leaveType: types[0].code }));
          }
        })
        .catch(() => {
          // Fallback to hardcoded only if API fails — treat as error
          toast.error('Failed to load leave types from server');
        });
    }
  }, [isOpen]);

  const getDaysCount = () => {
    if (formData.isHalfDay) return 0.5;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    // Base days calculated fully by calendar difference
    const diffTime = end.getTime() - start.getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Now add the fractional hour calculation
    const [sHours, sMins] = formData.startTime.split(':').map(Number);
    const [eHours, eMins] = formData.endTime.split(':').map(Number);
    
    const totalStartMinutes = (sHours * 60) + sMins;
    const totalEndMinutes = (eHours * 60) + eMins;
    
    let hoursDiff = (totalEndMinutes - totalStartMinutes) / 60;
    
    // Standard working day is considered 9 hours (09:00 to 18:00)
    // If same day, return the fractional duration
    if (diffDays === 0) {
      if (hoursDiff <= 0) return 0;
      return Number(Math.min(hoursDiff / 9, 1).toFixed(2));
    }
    
    // If multiple days, it's the number of FULL intermediate days + the fractional portions of the first/last day.
    // For simplicity, we just take the (EndDate - StartDate in days) + fractional time diff
    let totalFraction = diffDays + (hoursDiff / 9);
    
    return Number(Math.max(totalFraction, 0).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const startObj = new Date(formData.startDate);
      const endObj = new Date(formData.endDate);
      startObj.setHours(0, 0, 0, 0);
      endObj.setHours(0, 0, 0, 0);

      if (endObj.getTime() < startObj.getTime()) {
        toast.error("End date cannot be earlier than start date");
        setLoading(false);
        return;
      }
      
      // Also validate times if dates are exactly the same
      if (endObj.getTime() === startObj.getTime() && !formData.isHalfDay) {
        const [sH, sM] = formData.startTime.split(':').map(Number);
        const [eH, eM] = formData.endTime.split(':').map(Number);
        if ((eH * 60 + eM) <= (sH * 60 + sM)) {
          toast.error("End time must be after start time on the same date");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.isHalfDay ? formData.startDate.toISOString() : formData.endDate.toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfDays: getDaysCount()
      };
      
      // Remove applyTo from frontend payload; backend will auto-assign based on user's manager
      delete payload.applyTo;

      await api.post('/leaves/apply', payload);
      toast.success('Leave application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]">
            <h2 className="text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[color:var(--accent-primary)]" />
              Apply Leave
            </h2>
            <button onClick={onClose} className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors p-1 rounded hover:bg-[color:var(--bg-overlay)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <form id="apply-leave-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Leave Type */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-2">Leave Type *</label>
                  {leaveTypes.length === 0 ? (
                    <div className="animate-pulse h-10 bg-[color:var(--bg-overlay)] rounded-md" />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {leaveTypes.map(lt => (
                        <label key={lt.code} className={`cursor-pointer border py-2 px-3 rounded-md text-sm text-center capitalize transition-colors ${formData.leaveType === lt.code ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-glow)] text-[color:var(--text-primary)]' : 'border-[color:var(--border-subtle)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-secondary)]'}`}>
                          <input type="radio" name="leaveType" value={lt.code} checked={formData.leaveType === lt.code} onChange={(e) => setFormData({...formData, leaveType: e.target.value})} className="hidden" />
                          {lt.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Half Day Toggle */}
              <div className="flex items-center gap-4 p-3 bg-[color:var(--bg-overlay)] rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[color:var(--text-primary)]">
                  <input type="checkbox" checked={formData.isHalfDay} onChange={(e) => setFormData({...formData, isHalfDay: e.target.checked})} className="accent-[color:var(--accent-primary)]" />
                  Request Half Day
                </label>
                {formData.isHalfDay && (
                  <select value={formData.halfDayType} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} className="bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-xs rounded px-2 py-1 text-[color:var(--text-primary)]">
                    <option value="first_half">First Half</option>
                    <option value="second_half">Second Half</option>
                  </select>
                )}
              </div>

              {/* Row 3: Dates & Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-2">From *</label>
                  <div className="flex gap-2">
                    <input 
                      type="date"
                      value={formData.startDate.toISOString().split('T')[0]}
                      onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value)})}
                      className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]"
                      required
                    />
                    {!formData.isHalfDay && (
                      <input 
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-24 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-md px-2 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]"
                        required
                      />
                    )}
                  </div>
                </div>
                {!formData.isHalfDay && (
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-2">To *</label>
                    <div className="flex gap-2">
                      <input 
                        type="date"
                        value={formData.endDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData({...formData, endDate: new Date(e.target.value)})}
                        className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]"
                        required
                      />
                      <input 
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-24 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-md px-2 py-2 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Math Summary */}
              <div className="bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] border-dashed p-4 rounded-lg flex justify-between items-center text-sm">
                <span className="text-[color:var(--text-secondary)]">Total Days Requested:</span>
                <span className="font-bold text-lg text-[color:var(--text-primary)]">{getDaysCount()}</span>
              </div>

              {/* Row 5: Reason */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-2 flex items-center justify-between">
                  <span>Reason *</span>
                  <span className="text-xs">{formData.reason.length}/500</span>
                </label>
                <div className="relative">
                  <FileText className="absolute top-3 left-3 w-4 h-4 text-[color:var(--text-secondary)]" />
                  <textarea 
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value.substring(0, 500)})}
                    required
                    rows="3"
                    className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-[color:var(--accent-primary)] resize-none"
                    placeholder="Provide a brief reason..."
                  />
                </div>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-base)] flex justify-end gap-3 rounded-b-xl">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 font-medium text-[color:var(--text-primary)] border border-[color:var(--border-subtle)] rounded-md hover:bg-[color:var(--bg-overlay)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="apply-leave-form"
              disabled={loading}
              className="px-6 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-md hover:bg-[color:var(--accent-muted)] transition-colors flex justify-center items-center gap-2 min-w-[120px] shadow-[0_0_15px_rgba(0,255,135,0.2)] disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" /> : 'Apply Leave'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
  
  return createPortal(modalContent, document.body);
};

export default ApplyLeaveModal;
