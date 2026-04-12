import LeaveType from '../models/LeaveType.js';
import { writeAudit } from '../utils/audit.js';

// @route GET /api/leave-types  (everyone authenticated)
// Returns active leave types — optionally filtered by gender
export const getLeaveTypes = async (req, res, next) => {
  try {
    const { gender, active } = req.query;
    const filter = {};

    if (active !== 'false') filter.isActive = true; // default to active only
    if (gender && gender !== 'all') {
      filter.genderRestriction = { $in: ['all', gender] };
    }

    const types = await LeaveType.find(filter).sort('sortOrder name');
    res.status(200).json({ success: true, count: types.length, leaveTypes: types });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/leave-types  (Admin only)
export const createLeaveType = async (req, res, next) => {
  try {
    const { name, code, description, color, maxDaysPerYear, isHalfDayAllowed, isPaid, genderRestriction, sortOrder } = req.body;
    const existing = await LeaveType.findOne({ code: code.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Leave type with this code already exists' });

    const lt = await LeaveType.create({ name, code, description, color, maxDaysPerYear, isHalfDayAllowed, isPaid, genderRestriction, sortOrder });
    await writeAudit(req.user, 'leaveType.created', `Leave type "${lt.name}" created`, lt._id, 'LeaveType');
    res.status(201).json({ success: true, leaveType: lt });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/leave-types/:id  (Admin only)
export const updateLeaveType = async (req, res, next) => {
  try {
    const lt = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lt) return res.status(404).json({ success: false, message: 'Leave type not found' });
    await writeAudit(req.user, 'leaveType.updated', `Leave type "${lt.name}" updated`, lt._id, 'LeaveType');
    res.status(200).json({ success: true, leaveType: lt });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/leave-types/:id  (Admin only) — soft delete
export const deleteLeaveType = async (req, res, next) => {
  try {
    const lt = await LeaveType.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!lt) return res.status(404).json({ success: false, message: 'Leave type not found' });
    await writeAudit(req.user, 'leaveType.deleted', `Leave type "${lt.name}" deactivated`, lt._id, 'LeaveType');
    res.status(200).json({ success: true, message: 'Leave type deactivated' });
  } catch (error) {
    next(error);
  }
};
