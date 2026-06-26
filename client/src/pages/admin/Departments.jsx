import { useEffect, useState } from 'react';
import { Plus, Building2, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { PageHeader, Card, Button, EmptyState, Modal, Skeleton } from '../../components/ui';

const emptyForm = { name: '', description: '', parentDepartment: '', headOf: '' };

const DeptNode = ({ dept, onEdit, onDelete, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = dept.children && dept.children.length > 0;
  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-overlay/40 transition-colors" onClick={() => hasChildren && setExpanded((e) => !e)}>
        {hasChildren ? <ChevronRight className={`w-4 h-4 text-content-tertiary transition-transform ${expanded ? 'rotate-90' : ''}`} /> : <span className="w-4" />}
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[color:var(--accent-glow)] grid place-items-center text-accent shrink-0"><Building2 className="w-4 h-4" /></div>
        <span className="font-semibold text-content">{dept.name}</span>
        {dept.description && <span className="text-xs text-content-secondary hidden sm:block truncate">— {dept.description}</span>}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(dept); }} aria-label="Edit" className="w-8 h-8 grid place-items-center hover:bg-overlay rounded-[var(--radius-sm)] text-content-secondary hover:text-content transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(dept); }} aria-label="Delete" className="w-8 h-8 grid place-items-center hover:bg-[color:var(--danger)]/10 rounded-[var(--radius-sm)] text-content-secondary hover:text-[color:var(--danger)] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="pl-6 pr-3 pb-3 space-y-2 border-t border-line/60 pt-2">
          {dept.children.map((child) => <DeptNode key={child._id} dept={child} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [flatDepts, setFlatDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const [treeRes, flatRes] = await Promise.all([api.get('/departments?nested=true'), api.get('/departments')]);
      setDepartments(treeRes.data.departments || []);
      setFlatDepts(flatRes.data.departments || []);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchDepts(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (dept) => { setEditTarget(dept); setForm({ name: dept.name, description: dept.description || '', parentDepartment: dept.parentDepartment || '', headOf: dept.headOf || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, parentDepartment: form.parentDepartment || null, headOf: form.headOf || null };
      if (editTarget) { await api.put(`/departments/${editTarget._id}`, payload); toast.success('Department updated'); }
      else { await api.post('/departments', payload); toast.success('Department created'); }
      setShowModal(false);
      fetchDepts();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete department "${dept.name}"?`)) return;
    try { await api.delete(`/departments/${dept._id}`); toast.success('Department deleted'); fetchDepts(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to delete'); }
  };

  const field = 'w-full bg-base border border-line text-content rounded-[var(--radius-sm)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Structure" title="Departments" icon={Building2} subtitle="Manage organisation structure — supports nested departments."
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add department</Button>} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" action={<Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Create the first one</Button>} />
      ) : (
        <div className="space-y-3">
          {departments.map((dept) => <DeptNode key={dept._id} dept={dept} onEdit={openEdit} onDelete={handleDelete} />)}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${editTarget ? 'Edit' : 'New'} department`} icon={Building2}
        footer={<>
          <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="flex-1" loading={saving} onClick={handleSave}>{editTarget ? 'Update' : 'Create'}</Button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-secondary block mb-1.5">Name <span className="text-[color:var(--danger)]">*</span></label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Engineering" className={field} />
          </div>
          <div>
            <label className="text-sm font-medium text-content-secondary block mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional" className={field} />
          </div>
          <div>
            <label className="text-sm font-medium text-content-secondary block mb-1.5">Parent department</label>
            <select value={form.parentDepartment} onChange={(e) => setForm((p) => ({ ...p, parentDepartment: e.target.value }))} className={field}>
              <option value="">None (top-level)</option>
              {flatDepts.filter((d) => d._id !== editTarget?._id).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;
