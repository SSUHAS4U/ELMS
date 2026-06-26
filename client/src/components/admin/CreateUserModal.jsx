import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Modal } from '../ui';
import Button from '../ui/Button';

const inputClass = 'w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 placeholder:text-content-tertiary transition-all';

const CreateUserModal = ({ isOpen, onClose, onSuccess, userToEdit = null, users = [] }) => {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', role: 'employee', employeeId: '', department: '', manager: '', password: '' });

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsManagerDropdownOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateNextId = (role, usersList) => {
    const roleUsers = usersList.filter((u) => u.role === role && u.employeeId);
    const prefix = role === 'employee' ? 'EMP' : role === 'hr' ? 'HR' : 'ADMIN';
    if (roleUsers.length === 0) return `${prefix}-001`;
    let max = 0;
    roleUsers.forEach((u) => { const parts = u.employeeId.split('-'); if (parts.length > 1) { const num = parseInt(parts[1], 10); if (!isNaN(num) && num > max) max = num; } });
    return `${prefix}-${String(max + 1).padStart(3, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      api.get('/users/managers').then((res) => setManagers(res.data.managers || [])).catch(() => toast.error('Failed to load managers lists'));
      if (userToEdit) {
        setFormData({ name: userToEdit.name || '', email: userToEdit.email || '', role: userToEdit.role || 'employee', employeeId: userToEdit.employeeId || '', department: userToEdit.department?._id || userToEdit.department || '', manager: userToEdit.manager?._id || userToEdit.manager || '', password: '' });
      } else {
        setFormData({ name: '', email: '', role: 'employee', employeeId: generateNextId('employee', users), department: '', manager: '', password: '' });
      }
    }
  }, [isOpen, userToEdit]);

  useEffect(() => {
    if (isOpen && !userToEdit) setFormData((prev) => ({ ...prev, employeeId: generateNextId(formData.role, users) }));
  }, [formData.role, isOpen, userToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.department) delete payload.department;
      if (!payload.manager) delete payload.manager;
      if (userToEdit) { delete payload.password; await api.put(`/users/${userToEdit._id}`, payload); toast.success('User updated successfully.'); }
      else { await api.post('/users/create', payload); toast.success('User created! Temporary credentials generated.'); }
      onSuccess(); onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter((m) => m.name.toLowerCase().includes(managerSearchQuery.toLowerCase()) || m.role.toLowerCase().includes(managerSearchQuery.toLowerCase()));
  const selectedManager = managers.find((m) => m._id === formData.manager);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? 'Edit member' : 'Add new member'} icon={UserPlus}
      footer={<>
        <Button variant="outline" className="ml-auto" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="createUserForm" loading={loading}>{userToEdit ? 'Save changes' : 'Create user'}</Button>
      </>}>
      <form id="createUserForm" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">Full name *</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Jane Doe" />
        </div>

        {!userToEdit && (
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">Initial password (optional)</label>
            <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder="Leave blank to auto-generate" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="jane@company.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">Employee ID</label>
            <input type="text" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className={inputClass} placeholder="EMP-003" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">System role *</label>
          <div className="grid grid-cols-3 gap-2">
            {['employee', 'hr', 'admin'].map((role) => (
              <button key={role} type="button" onClick={() => setFormData({ ...formData, role })}
                className={`py-2.5 px-3 rounded-[var(--radius-sm)] text-sm font-semibold capitalize transition-all border ${formData.role === role ? 'border-accent bg-[color:var(--accent-glow)] text-accent' : 'border-line text-content-secondary hover:border-content-tertiary hover:text-content'}`}>
                {role === 'hr' ? 'HR Manager' : role}
              </button>
            ))}
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-content-secondary mb-1.5 uppercase tracking-wider">Assign HR / Manager</label>
          <div onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)} className={`flex items-center justify-between cursor-pointer ${inputClass} ${!selectedManager ? 'text-content-tertiary' : ''}`}>
            {selectedManager ? `${selectedManager.name} (${selectedManager.role.toUpperCase()})` : 'Search & select manager…'}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </div>
          <AnimatePresence>
            {isManagerDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute z-10 w-full mt-1 glass-panel overflow-hidden">
                <div className="p-2 border-b border-line/60 flex items-center gap-2">
                  <Search className="w-4 h-4 text-content-tertiary shrink-0" />
                  <input type="text" placeholder="Type to search…" value={managerSearchQuery} onChange={(e) => setManagerSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-content placeholder:text-content-tertiary focus:outline-none" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredManagers.length === 0 ? (
                    <div className="p-3 text-sm text-content-secondary text-center">No managers found.</div>
                  ) : filteredManagers.map((m) => (
                    <div key={m._id} onClick={() => { setFormData({ ...formData, manager: m._id }); setIsManagerDropdownOpen(false); setManagerSearchQuery(''); }}
                      className={`p-3 text-sm cursor-pointer hover:bg-overlay border-l-2 transition-colors flex justify-between items-center ${formData.manager === m._id ? 'border-accent bg-[color:var(--accent-glow)]/40' : 'border-transparent'}`}>
                      <span className="font-medium text-content">{m.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-base text-content-secondary">{m.role}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
