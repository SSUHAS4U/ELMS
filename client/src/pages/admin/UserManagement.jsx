import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, ShieldAlert, CircleSlash, RotateCcw, Edit2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import CreateUserModal from '../../components/admin/CreateUserModal';
import ViewUserModal from '../../components/admin/ViewUserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToView, setUserToView] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error('Failed to load user registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      if (currentlyActive) {
        await api.delete(`/users/${id}`);
        toast.success('User deactivated.');
      } else {
        await api.patch(`/users/${id}/reactivate`);
        toast.success('User reactivated.');
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  // Client-side search filter
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.employeeId?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[color:var(--bg-surface)] p-5 rounded-xl border border-[color:var(--border-subtle)] shadow-sm">
        <h2 className="text-lg font-bold text-[color:var(--text-primary)] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[color:var(--accent-primary)]" />
          Organization Directory
          <span className="bg-[color:var(--bg-overlay)] text-[color:var(--text-secondary)] text-xs font-bold px-2.5 py-1 rounded-md ml-2">{users.length} Members</span>
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[color:var(--text-secondary)]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, ID..." 
              className="pl-9 pr-4 py-2 w-full text-sm bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-lg focus:outline-none focus:border-[color:var(--accent-primary)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]" 
            />
          </div>
          <button 
            onClick={() => { setUserToEdit(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[color:var(--bg-surface)] rounded-xl border border-[color:var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--bg-overlay)] border-b border-[color:var(--border-subtle)] text-[color:var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Employee</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Contact</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Role</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)] text-[color:var(--text-primary)]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-[color:var(--text-secondary)]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-[color:var(--text-secondary)]">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr 
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className={`hover:bg-[color:var(--bg-overlay)]/50 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] flex items-center justify-center font-bold text-sm text-[color:var(--text-primary)]">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{u.name}</p>
                          <p className="text-xs text-[color:var(--text-secondary)]">{u.employeeId || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[color:var(--text-secondary)] text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-[color:var(--info)]/15 text-[color:var(--info)] border border-[color:var(--info)]/25' 
                          : u.role === 'hr' 
                            ? 'bg-[color:var(--warning)]/15 text-[color:var(--warning)] border border-[color:var(--warning)]/25' 
                            : 'bg-[color:var(--bg-elevated)] text-[color:var(--text-secondary)] border border-[color:var(--border-subtle)]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-[color:var(--success)]' : 'bg-[color:var(--danger)]'}`}></div>
                        <span className="text-xs font-medium">{u.isActive ? 'Active' : 'Suspended'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => { setUserToView(u); setViewModalOpen(true); }} 
                        className="p-1.5 rounded text-[color:var(--text-secondary)] hover:bg-[color:var(--accent-primary)]/10 hover:text-[color:var(--accent-primary)] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setUserToEdit(u); setModalOpen(true); }} 
                        className="p-1.5 rounded text-[color:var(--text-secondary)] hover:bg-[color:var(--info)]/10 hover:text-[color:var(--info)] transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggleActive(u._id, u.isActive)} 
                          className={`p-1.5 rounded transition-colors ${
                            u.isActive 
                              ? 'text-[color:var(--text-secondary)] hover:bg-[color:var(--danger)]/10 hover:text-[color:var(--danger)]' 
                              : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--success)]/10 hover:text-[color:var(--success)]'
                          }`}
                          title={u.isActive ? 'Deactivate User' : 'Reactivate User'}
                        >
                          {u.isActive ? <CircleSlash className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <CreateUserModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setUserToEdit(null); }} 
        onSuccess={fetchUsers} 
        userToEdit={userToEdit}
        users={users}
      />

      <ViewUserModal 
        isOpen={viewModalOpen} 
        onClose={() => { setViewModalOpen(false); setUserToView(null); }} 
        user={userToView} 
      />
    </div>
  );
};

export default UserManagement;
