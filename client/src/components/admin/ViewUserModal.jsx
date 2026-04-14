import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Building2, Mail, Hash, ShieldCheck, CalendarRange, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const ViewUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/users/${user._id}/permanent`);
      toast.success('User permanently deleted');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[color:var(--bg-overlay)] transition-colors border border-transparent hover:border-[color:var(--border-subtle)]/50">
      <div className="w-8 h-8 rounded-full bg-[color:var(--bg-elevated)] flex items-center justify-center text-[color:var(--text-secondary)] shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">{label}</p>
        <p className="text-sm font-medium text-[color:var(--text-primary)]">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="relative h-24 bg-gradient-to-r from-[color:var(--accent-primary)]/20 to-transparent border-b border-[color:var(--border-subtle)] flex items-end px-6 pb-4">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] flex items-center justify-center text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors z-10 shadow-sm">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-2xl bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] shadow-md flex items-center justify-center text-[color:var(--text-primary)] font-black text-3xl">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            {/* Status Badge */}
            <div className="absolute top-4 left-6">
               <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                 user.isActive ? 'bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/20' : 'bg-[color:var(--danger)]/10 text-[color:var(--danger)] border border-[color:var(--danger)]/20'
               }`}>
                 {user.isActive ? 'Active Member' : 'Suspended'}
               </span>
            </div>
          </div>

          {/* Body */}
          <div className="pt-14 px-6 pb-6">
            <h2 className="text-xl font-bold text-[color:var(--text-primary)]">{user.name}</h2>
            <p className="text-sm text-[color:var(--text-secondary)] mb-6 capitalize leading-relaxed">{window.location.host} · {user.role} Account</p>
            
            <div className="space-y-2 mb-8">
              <DetailRow icon={Mail} label="Contact Email" value={user.email} />
              <DetailRow icon={Hash} label="Employee ID" value={user.employeeId} />
              <DetailRow icon={ShieldCheck} label="System Role" value={<span className="capitalize">{user.role}</span>} />
              <DetailRow icon={Building2} label="Department" value={user.department?.name || 'Unassigned'} />
              <DetailRow icon={CalendarRange} label="Joined On" value={new Date(user.createdAt).toLocaleDateString('en-GB')} />
            </div>

            {/* Admin Actions */}
            <div className="pt-6 border-t border-[color:var(--border-subtle)] space-y-3">
              {!confirmDelete ? (
                <button 
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10 rounded-lg transition-colors border border-transparent hover:border-[color:var(--danger)]/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Request Account Deletion
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[color:var(--danger)]/5 border border-[color:var(--danger)]/20 rounded-xl"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="mt-0.5 p-1.5 bg-[color:var(--danger)]/10 text-[color:var(--danger)] rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--text-primary)]">Are you absolutely sure?</p>
                      <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed mt-1">This action is permanent and cannot be undone. All user data, credentials, and records will be purged.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 py-2 bg-[color:var(--danger)] text-white text-xs font-bold rounded-lg hover:bg-[color:var(--danger)]/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Deletion'}
                    </button>
                    <button 
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-[color:var(--text-secondary)] text-xs font-bold rounded-lg hover:text-[color:var(--text-primary)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ViewUserModal;
