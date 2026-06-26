import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Users, CircleSlash, RotateCcw, Edit2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import CreateUserModal from '../../components/admin/CreateUserModal';
import ViewUserModal from '../../components/admin/ViewUserModal';
import { PageHeader, Card, EmptyState, Button, Skeleton } from '../../components/ui';

const ROLE_TONE = {
  admin: 'bg-[color:var(--info)]/14 text-[color:var(--info)] border border-[color:var(--info)]/25',
  hr: 'bg-[color:var(--warning)]/14 text-[color:var(--warning)] border border-[color:var(--warning)]/25',
  employee: 'bg-overlay text-content-secondary border border-line',
};

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
    } catch {
      toast.error('Failed to load user registry');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      if (currentlyActive) { await api.delete(`/users/${id}`); toast.success('User deactivated.'); }
      else { await api.patch(`/users/${id}/reactivate`); toast.success('User reactivated.'); }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.employeeId?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const cols = ['Employee', 'Contact', 'Role', 'Status', ''];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Access control" title="User Management" icon={Users} subtitle="Organization directory with role-based access control."
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, email, ID…"
                className="w-full h-10 pl-9 pr-4 text-sm bg-base border border-line rounded-[var(--radius-sm)] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 text-content placeholder:text-content-tertiary" />
            </div>
            <Button onClick={() => { setUserToEdit(null); setModalOpen(true); }}><UserPlus className="w-4 h-4" /> Add user</Button>
          </div>
        } />

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line/60 flex items-center gap-2">
          <h2 className="font-display font-semibold text-content">Directory</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-overlay text-content-secondary">{users.length} members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-content-tertiary border-b border-line/60">
              {cols.map((c, i) => <th key={i} className={`px-5 py-3 font-semibold text-[11px] tracking-wider uppercase ${i === 4 ? 'text-right' : ''}`}>{c}</th>)}
            </tr></thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => <tr key={i} className="border-b border-line/40"><td colSpan={5} className="px-5 py-3"><Skeleton className="h-7 w-full" /></td></tr>)
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={Users} title={searchQuery ? `No results for "${searchQuery}"` : 'No users found'} /></td></tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className={`border-b border-line/40 last:border-0 hover:bg-overlay/40 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[color:var(--accent-glow)] grid place-items-center font-bold text-sm text-accent shrink-0">{u.name?.charAt(0) || '?'}</div>
                        <div>
                          <p className="font-semibold text-sm text-content">{u.name}</p>
                          <p className="text-xs text-content-secondary font-mono">{u.employeeId || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-content-secondary">{u.email}</td>
                    <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ROLE_TONE[u.role] || ROLE_TONE.employee}`}>{u.role}</span></td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-[color:var(--success)]' : 'bg-[color:var(--danger)]'}`} />
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setUserToView(u); setViewModalOpen(true); }} title="View details"
                          className="w-8 h-8 grid place-items-center rounded-[var(--radius-sm)] text-content-secondary hover:bg-[color:var(--accent-glow)] hover:text-accent transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setUserToEdit(u); setModalOpen(true); }} title="Edit user"
                          className="w-8 h-8 grid place-items-center rounded-[var(--radius-sm)] text-content-secondary hover:bg-[color:var(--info)]/10 hover:text-[color:var(--info)] transition-colors"><Edit2 className="w-4 h-4" /></button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleToggleActive(u._id, u.isActive)} title={u.isActive ? 'Deactivate' : 'Reactivate'}
                            className={`w-8 h-8 grid place-items-center rounded-[var(--radius-sm)] text-content-secondary transition-colors ${u.isActive ? 'hover:bg-[color:var(--danger)]/10 hover:text-[color:var(--danger)]' : 'hover:bg-[color:var(--success)]/10 hover:text-[color:var(--success)]'}`}>
                            {u.isActive ? <CircleSlash className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateUserModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setUserToEdit(null); }} onSuccess={fetchUsers} userToEdit={userToEdit} users={users} />
      <ViewUserModal isOpen={viewModalOpen} onClose={() => { setViewModalOpen(false); setUserToView(null); }} user={userToView} onSuccess={fetchUsers} />
    </div>
  );
};

export default UserManagement;
