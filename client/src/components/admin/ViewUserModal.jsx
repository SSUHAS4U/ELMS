import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Mail, Hash, ShieldCheck, CalendarRange, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const ViewUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) { setConfirmDelete(false); setIsDeleting(false); return; }
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, user?._id, onClose]);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/users/${user._id}/permanent`);
      toast.success('User permanently deleted');
      onSuccess?.(); onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-full bg-overlay grid place-items-center text-content-secondary shrink-0"><Icon className="w-4 h-4" /></div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-content-tertiary">{label}</p>
        <p className="text-sm font-medium text-content truncate">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="User details">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-sm bg-surface border border-line rounded-2xl shadow-glass overflow-hidden flex flex-col max-h-[90dvh]"
        >
          {/* Banner — holds the avatar so the scroll area never clips it */}
          <div className="relative h-20 shrink-0"
            style={{ background: 'linear-gradient(120deg, var(--accent-glow), transparent 65%), var(--bg-elevated)' }}>
            <span className={`absolute top-4 left-5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-[color:var(--success)]/15 text-[color:var(--success)] border border-[color:var(--success)]/25' : 'bg-[color:var(--danger)]/15 text-[color:var(--danger)] border border-[color:var(--danger)]/25'}`}>
              {user.isActive ? 'Active member' : 'Suspended'}
            </span>
            <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface border border-line grid place-items-center text-content-secondary hover:text-content transition-colors z-10"><X className="w-4 h-4" /></button>
            <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-[color:var(--accent-glow)] ring-4 ring-[color:var(--bg-surface)] grid place-items-center text-accent font-bold text-3xl font-display shadow-sm z-10">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="px-6 pb-6 pt-14 overflow-y-auto overscroll-contain">
            <h2 className="font-display text-xl font-bold text-content">{user.name}</h2>
            <p className="text-sm text-content-secondary capitalize mb-4">{user.role} account</p>

            <div className="divide-y divide-line/60 border-y border-line/60">
              <DetailRow icon={Mail} label="Contact email" value={user.email} />
              <DetailRow icon={Hash} label="Employee ID" value={user.employeeId} />
              <DetailRow icon={ShieldCheck} label="System role" value={<span className="capitalize">{user.role}</span>} />
              <DetailRow icon={Building2} label="Department" value={user.department?.name || 'Unassigned'} />
              <DetailRow icon={CalendarRange} label="Joined on" value={new Date(user.createdAt).toLocaleDateString('en-GB')} />
            </div>

            <div className="pt-5">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10 rounded-[var(--radius-sm)] transition-colors border border-transparent hover:border-[color:var(--danger)]/20">
                  <Trash2 className="w-4 h-4" /> Request account deletion
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[color:var(--danger)]/6 border border-[color:var(--danger)]/20 rounded-[var(--radius)]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="mt-0.5 p-1.5 bg-[color:var(--danger)]/12 text-[color:var(--danger)] rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-bold text-content">Are you absolutely sure?</p>
                      <p className="text-xs text-content-secondary leading-relaxed mt-1">This action is permanent. All user data, credentials, and records will be purged.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2 bg-[color:var(--danger)] text-white text-xs font-bold rounded-[var(--radius-sm)] hover:brightness-110 transition-all disabled:opacity-50">
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm deletion'}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 bg-elevated border border-line text-content-secondary text-xs font-bold rounded-[var(--radius-sm)] hover:text-content transition-colors">Cancel</button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ViewUserModal;
