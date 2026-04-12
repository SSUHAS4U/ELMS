import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { writeAudit } from '../utils/audit.js';

// @route POST /api/leaves/apply (Employee)
export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, isHalfDay, halfDayType, startDate, endDate, startTime, endTime, numberOfDays, reason } = req.body;

    // Validation checks can go here
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    let applyToId = req.user.manager;
    let fallbackUsed = false;

    if (!applyToId) {
      // Prioritize assigning to a dedicated HR rather than the first admin found
      const fallback = await User.findOne({ role: 'hr' });
      if (!fallback) {
        // If no HR exists in DB at all, fallback to admin
        const adminFallback = await User.findOne({ role: 'admin' });
        if (!adminFallback) {
          return res.status(400).json({ success: false, message: 'No HR/Manager available to review this leave.' });
        }
        applyToId = adminFallback._id;
      } else {
        applyToId = fallback._id;
      }
      fallbackUsed = true;
    }

    const leave = await LeaveRequest.create({
      employee: req.user._id,
      leaveType: leaveType.toLowerCase(),
      isHalfDay,
      halfDayType: isHalfDay ? halfDayType : undefined,
      startDate: new Date(startDate),
      startTime,
      endDate: new Date(endDate),
      endTime,
      numberOfDays,
      reason,
      applyTo: applyToId
    });

    // Automatically emit via App's raw socket
    req.io.emit('newLeaveRequest', {
      employee: req.user.name,
      leaveType,
      dates: `${startDate} to ${endDate}`
    });

    // Send application email to the assigned HR/Manager
    const assignedReviewer = await User.findById(applyToId);
    if (assignedReviewer && assignedReviewer.email) {
      try {
        await sendEmail({
          email: assignedReviewer.email,
          subject: 'New Leave Request Requires Approval',
          templateName: 'leave-manager-notification',
          context: { 
            managerName: assignedReviewer.name,
            employeeName: req.user.name, 
            type: leaveType,
            startDate: new Date(startDate).toLocaleDateString(),
            endDate: new Date(endDate).toLocaleDateString(),
            appUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          }
        });
      } catch (emailError) {
        // If mail exists but SMTP failed, raise error natively (will trigger 500 block)
        throw new Error('Leave recorded, but failed to deliver notification email to HR. SMTP Error.');
      }
    }

    res.status(201).json({ success: true, leave });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/leaves/my
export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id })
      .populate('applyTo', 'name')
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/leaves/all (HR/Admin)
export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('employee', 'name email avatar department')
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/leaves/pending (HR/Admin)
export const getPendingApprovals = async (req, res, next) => {
  try {
    // Return leaves pending specifically requested to this HR, OR all pending if Admin
    const filter = { status: 'pending' };
    if (req.user.role === 'hr') {
      filter.applyTo = req.user._id;
    }
    
    const leaves = await LeaveRequest.find(filter)
      .populate('employee', 'name email department')
      .sort('startDate');
    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/leaves/:id/approve (HR/Admin)
export const approveLeave = async (req, res, next) => {
  try {
    const { approvalNote } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('employee');

    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Leave is already processed' });

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvalNote = approvalNote;
    leave.approvedAt = Date.now();
    await leave.save();

    // Deduct balance
    const employee = await User.findById(leave.employee._id);
    if(employee && employee.leaveBalance[leave.leaveType] !== undefined) {
      employee.leaveBalance[leave.leaveType] -= leave.numberOfDays;
      await employee.save();
    }

    req.io.emit('leaveStatusChanged', { status: 'approved', leaveId: leave._id, employeeId: leave.employee._id });

    // Send email notification
    await sendEmail({
      email: leave.employee.email,
      subject: 'Leave Request Approved',
      template: 'leave-approved',
      context: { note: approvalNote, dates: `${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}` }
    });

    res.status(200).json({ success: true, leave });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/leaves/:id/reject (HR/Admin)
export const rejectLeave = async (req, res, next) => {
  try {
    const { approvalNote } = req.body;
    const leave = await LeaveRequest.findById(req.params.id).populate('employee');

    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    leave.status = 'rejected';
    leave.approvedBy = req.user._id;
    leave.approvalNote = approvalNote;
    leave.approvedAt = Date.now();
    await leave.save();

    req.io.emit('leaveStatusChanged', { status: 'rejected', leaveId: leave._id, employeeId: leave.employee._id });

    // Send email notification
    await sendEmail({
      email: leave.employee.email,
      subject: 'Leave Request Rejected',
      template: 'leave-rejected',
      context: { note: approvalNote, dates: `${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}` }
    });

    res.status(200).json({ success: true, leave });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/leaves/balance (Employee)
// Live-computed leave balances from the user document
export const getLeaveBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('leaveBalance name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, balance: user.leaveBalance });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/leaves/:id/cancel (Employee — own pending leaves only)
export const cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your leave request' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending requests' });
    }
    leave.status = 'rejected';
    leave.approvalNote = 'Cancelled by employee';
    leave.approvedAt = Date.now();
    await leave.save();
    await writeAudit(req.user, 'leave.cancelled', `Leave request cancelled by ${req.user.name}`, leave._id, 'LeaveRequest');
    res.status(200).json({ success: true, message: 'Leave cancelled', leave });
  } catch (error) {
    next(error);
  }
};
