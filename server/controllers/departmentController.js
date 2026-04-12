import Department from '../models/Department.js';
import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';

// @route GET /api/departments  (everyone authenticated)
// Returns all departments — nested by parent_id if ?nested=true
export const getDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find().sort('name').lean();

    if (req.query.nested === 'true') {
      // Build nested tree
      const map = {};
      depts.forEach(d => { map[d._id] = { ...d, children: [] }; });
      const tree = [];
      depts.forEach(d => {
        if (d.parentDepartment && map[d.parentDepartment]) {
          map[d.parentDepartment].children.push(map[d._id]);
        } else {
          tree.push(map[d._id]);
        }
      });
      return res.status(200).json({ success: true, departments: tree });
    }

    res.status(200).json({ success: true, count: depts.length, departments: depts });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/departments/:id/employees  (Admin/HR)
export const getDepartmentEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ department: req.params.id, isActive: true })
      .select('name email designation avatar')
      .sort('name');
    res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/departments  (Admin only)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, parentDepartment, headOf } = req.body;
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ success: false, message: 'Department already exists' });

    const dept = await Department.create({ name, description, parentDepartment: parentDepartment || null, headOf: headOf || null });
    await writeAudit(req.user, 'department.created', `Department "${dept.name}" created`, dept._id, 'Department');
    res.status(201).json({ success: true, department: dept });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/departments/:id  (Admin only)
export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, parentDepartment, headOf } = req.body;
    const dept = await Department.findByIdAndUpdate(
      req.params.id, 
      { name, description, parentDepartment: parentDepartment || null, headOf: headOf || null }, 
      { new: true, runValidators: true }
    );
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    await writeAudit(req.user, 'department.updated', `Department "${dept.name}" updated`, dept._id, 'Department');
    res.status(200).json({ success: true, department: dept });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/departments/:id  (Admin only)
export const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    
    const hasEmployees = await User.countDocuments({ department: req.params.id, isActive: true });
    if (hasEmployees > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${hasEmployees} active employees in this department` });
    }

    await Department.findByIdAndDelete(req.params.id);
    await writeAudit(req.user, 'department.deleted', `Department "${dept.name}" deleted`, dept._id, 'Department');
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (error) {
    next(error);
  }
};
