import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Plus, Building2, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const emptyForm = { name: '', description: '', parentDepartment: '', headOf: '' };

const DeptNode = ({ dept, allDepts, users, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = dept.children && dept.children.length > 0;

  return (
    <div className="border border-[color:var(--border-subtle)] rounded-xl overflow-hidden bg-[color:var(--bg-surface)] shadow-sm">
      <div className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-[color:var(--bg-overlay)]/50 transition-colors"
        onClick={() => hasChildren && setExpanded(e => !e)}>
        {hasChildren && (
          <ChevronRight className={`w-4 h-4 text-[color:var(--text-secondary)] transition-transform ${expanded ? 'rotate-90' : ''}`} />
        )}
        {!hasChildren && <div className="w-4" />}
        <Building2 className="w-4 h-4 text-[color:var(--accent-primary)]" />
        <span className="font-semibold text-[color:var(--text-primary)]">{dept.name}</span>
        {dept.description && <span className="text-xs text-[color:var(--text-secondary)] hidden sm:block">— {dept.description}</span>}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onEdit(dept); }}
            className="p-1.5 hover:bg-[color:var(--bg-overlay)] rounded-md text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(dept); }}
            className="p-1.5 hover:bg-[color:var(--danger)]/10 rounded-md text-[color:var(--text-secondary)] hover:text-[color:var(--danger)] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="pl-6 pr-3 pb-3 space-y-2 border-t border-[color:var(--border-subtle)] pt-2">
          {dept.children.map(child => (
            <DeptNode key={child._id} dept={child} allDepts={allDepts} users={users} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [flatDepts, setFlatDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get('/departments?nested=true'),
        api.get('/departments')
      ]);
      setDepartments(treeRes.data.departments || []);
      setFlatDepts(flatRes.data.departments || []);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDepts();
    api.get('/users?role=hr&active=true').then(r => setUsers(r.data.users || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (dept) => { setEditTarget(dept); setForm({ name: dept.name, description: dept.description || '', parentDepartment: dept.parentDepartment || '', headOf: dept.headOf || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, parentDepartment: form.parentDepartment || null, headOf: form.headOf || null };
      if (editTarget) {
        await api.put(`/departments/${editTarget._id}`, payload);
        toast.success('Department updated');
      } else {
        await api.post('/departments', payload);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchDepts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete department "${dept.name}"?`)) return;
    try {
      await api.delete(`/departments/${dept._id}`);
      toast.success('Department deleted');
      fetchDepts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">Departments</h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">Manage organisation structure — supports nested departments</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[color:var(--accent-primary)] text-black font-semibold rounded-xl hover:bg-[color:var(--accent-muted)] transition-colors shadow-sm text-sm">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[color:var(--border-subtle)] rounded-xl text-[color:var(--text-secondary)]">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No departments yet. <button onClick={openCreate} className="text-[color:var(--accent-primary)] font-semibold">Create the first one →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {departments.map(dept => (
            <DeptNode key={dept._id} dept={dept} allDepts={flatDepts} users={users} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold text-[color:var(--text-primary)]">{editTarget ? 'Edit' : 'New'} Department</h2>
                  <button onClick={() => setShowModal(false)} className="p-1 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--bg-overlay)]"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  {[{ key: 'name', label: 'Name *', placeholder: 'e.g. Engineering' },
                    { key: 'description', label: 'Description', placeholder: 'Optional' }
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1">{f.label}</label>
                      <input value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                        placeholder={f.placeholder}
                        className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1">Parent Department</label>
                    <select value={form.parentDepartment} onChange={e => setForm(p => ({...p, parentDepartment: e.target.value}))}
                      className="w-full bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--accent-primary)]">
                      <option value="">None (top-level)</option>
                      {flatDepts.filter(d => d._id !== editTarget?._id).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[color:var(--border-subtle)] rounded-lg text-[color:var(--text-primary)] font-medium hover:bg-[color:var(--bg-overlay)] transition-colors text-sm">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 bg-[color:var(--accent-primary)] text-black font-bold rounded-lg hover:bg-[color:var(--accent-muted)] transition-colors text-sm disabled:opacity-50 flex justify-center items-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" /> : null}
                    {editTarget ? 'Update' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Departments;
