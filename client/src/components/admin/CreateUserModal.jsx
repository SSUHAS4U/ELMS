import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const CreateUserModal = ({ isOpen, onClose, onSuccess, userToEdit = null, users = [] }) => {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    employeeId: '',
    department: '',
    manager: '',
    password: ''
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsManagerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateNextId = (role, usersList) => {
    const roleUsers = usersList.filter(u => u.role === role && u.employeeId);
    const prefix = role === 'employee' ? 'EMP' : role === 'hr' ? 'HR' : 'ADMIN';
    if (roleUsers.length === 0) return `${prefix}-001`;
    
    let max = 0;
    roleUsers.forEach(u => {
      const parts = u.employeeId.split('-');
      if (parts.length > 1) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return `${prefix}-${String(max + 1).padStart(3, '0')}`;
  };

  // Reset form and fetch managers
  useEffect(() => {
    if (isOpen) {
      api.get('/users/managers')
        .then(res => setManagers(res.data.managers || []))
        .catch(() => toast.error('Failed to load managers lists'));

      if (userToEdit) {
        setFormData({
          name: userToEdit.name || '',
          email: userToEdit.email || '',
          role: userToEdit.role || 'employee',
          employeeId: userToEdit.employeeId || '',
          department: userToEdit.department?._id || userToEdit.department || '',
          manager: userToEdit.manager?._id || userToEdit.manager || '',
          password: ''
        });
      } else {
        const defaultRole = 'employee';
        setFormData({ name: '', email: '', role: defaultRole, employeeId: generateNextId(defaultRole, users), department: '', manager: '', password: '' });
      }
    }
  }, [isOpen, userToEdit]);

  // Auto-generate employeeId on role change (only for new users)
  useEffect(() => {
    if (isOpen && !userToEdit) {
      setFormData(prev => ({ ...prev, employeeId: generateNextId(formData.role, users) }));
    }
  }, [formData.role, isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.department) delete payload.department;
      if (!payload.manager) delete payload.manager;
      if (userToEdit) delete payload.password;
      
      if (userToEdit) {
        await api.put(`/users/${userToEdit._id}`, payload);
        toast.success('User updated successfully.');
      } else {
        await api.post('/users/create', payload);
        toast.success('User created! Temporary credentials generated.');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter(m => m.name.toLowerCase().includes(managerSearchQuery.toLowerCase()) || m.role.toLowerCase().includes(managerSearchQuery.toLowerCase()));
  const selectedManager = managers.find(m => m._id === formData.manager);

  const inputClass = "w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-1 focus:ring-[color:var(--accent-primary)]/30 placeholder:text-[color:var(--text-secondary)]/60 transition-all";

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] shrink-0">
            <h2 className="text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[color:var(--accent-glow)] flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-[color:var(--accent-primary)]" />
              </div>
              {userToEdit ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-overlay)] hover:text-[color:var(--text-primary)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto">
            <form id="createUserForm" onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={inputClass}
                  placeholder="Jane Doe"
                />
              </div>
              
              {/* Password (Optional) */}
              {!userToEdit && (
                <div>
                  <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider">Initial Password (Optional)</label>
                  <input 
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className={inputClass}
                    placeholder="Leave blank to auto-generate"
                  />
                </div>
              )}

              {/* Email + Employee ID  */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={inputClass}
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider">Employee ID</label>
                  <input 
                    type="text" 
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                    className={inputClass}
                    placeholder="EMP-003"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-2 uppercase tracking-wider">System Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['employee', 'hr', 'admin'].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all border ${
                        formData.role === role 
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-glow)] text-[color:var(--accent-primary)] shadow-sm' 
                          : 'border-[color:var(--border-subtle)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
                      }`}
                    >
                      {role === 'hr' ? 'HR Manager' : role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manager Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5 uppercase tracking-wider">Assign HR/Manager</label>
                <div 
                  onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                  className={`flex items-center justify-between cursor-pointer ${inputClass} ${!selectedManager ? 'text-[color:var(--text-secondary)]/60' : ''}`}
                >
                  {selectedManager ? `${selectedManager.name} (${selectedManager.role.toUpperCase()})` : 'Search & Select Manager...'}
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </div>

                <AnimatePresence>
                  {isManagerDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 w-full mt-1 bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="p-2 border-b border-[color:var(--border-subtle)] flex items-center gap-2 bg-[color:var(--bg-surface)]">
                        <Search className="w-4 h-4 text-[color:var(--text-secondary)] shrink-0" />
                        <input
                          type="text"
                          placeholder="Type to search..."
                          value={managerSearchQuery}
                          onChange={(e) => setManagerSearchQuery(e.target.value)}
                          className="w-full bg-transparent text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]/60 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredManagers.length === 0 ? (
                          <div className="p-3 text-sm text-[color:var(--text-secondary)] text-center">No managers found.</div>
                        ) : (
                          filteredManagers.map(m => (
                            <div 
                              key={m._id}
                              onClick={() => {
                                setFormData({...formData, manager: m._id});
                                setIsManagerDropdownOpen(false);
                                setManagerSearchQuery('');
                              }}
                              className={`p-3 text-sm cursor-pointer hover:bg-[color:var(--bg-overlay)] border-l-2 transition-colors flex justify-between items-center ${formData.manager === m._id ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-glow)]/5' : 'border-transparent'}`}
                            >
                              <span className="font-medium text-[color:var(--text-primary)]">{m.name}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[color:var(--bg-surface)] text-[color:var(--text-secondary)]">{m.role}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </form>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-base)] shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium rounded-lg text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-overlay)] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="createUserForm"
              disabled={loading}
              className="px-5 py-2.5 bg-[color:var(--accent-primary)] text-black text-sm font-bold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Saving...' : (userToEdit ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CreateUserModal;
