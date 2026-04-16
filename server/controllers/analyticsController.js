import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import SwipeRecord from '../models/SwipeRecord.js';

// ─────────────────────────────────────────────
// @route GET /api/analytics/summary (Admin/HR)
// ─────────────────────────────────────────────
export const getSummary = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalEmployees,
      pendingLeaves,
      onLeaveToday,
      newHiresThisMonth,
      approvedThisYear
    ] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true }),
      LeaveRequest.countDocuments({ status: 'pending' }),
      LeaveRequest.countDocuments({
        status: 'approved',
        startDate: { $lte: today },
        endDate:   { $gte: today }
      }),
      User.countDocuments({ role: 'employee', createdAt: { $gte: startOfMonth } }),
      LeaveRequest.countDocuments({ status: 'approved', startDate: { $gte: startOfYear } })
    ]);

    res.status(200).json({
      success: true,
      data: { totalEmployees, pendingLeaves, onLeaveToday, newHiresThisMonth, approvedThisYear }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route GET /api/analytics/department (Admin/HR)
// Employees per department — for BarChart
// ─────────────────────────────────────────────
export const getDepartmentStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'employee', isActive: true } },
      { 
        $group: { 
          _id: { $ifNull: ['$department', 'unassigned'] }, 
          count: { $sum: 1 } 
        } 
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { 
        $project: { 
          _id: 0, 
          name: { $ifNull: ['$dept.name', 'Unassigned'] }, 
          count: 1 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('[Analytics] Department Stats Error:', error.message);
    res.status(200).json({ success: true, message: 'Failsafe: error loading department stats', data: [] });
  }
};

// ─────────────────────────────────────────────
// @route GET /api/analytics/trends (Admin/HR)
// Monthly leave days for last 12 months — for LineChart
// ─────────────────────────────────────────────
export const getLeaveTrends = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const raw = await LeaveRequest.aggregate([
      {
        $match: {
          status: 'approved',
          startDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$startDate' },
            month: { $month: '$startDate' }
          },
          totalDays: { $sum: '$numberOfDays' },
          count:     { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = raw.map(r => ({
      month:     MONTHS[r._id.month - 1],
      year:      r._id.year,
      totalDays: r.totalDays,
      count:     r.count
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route GET /api/analytics/leave-types (Admin/HR)
// Leave days by type (donut chart) for current year
// ─────────────────────────────────────────────
export const getLeaveTypeDistribution = async (req, res, next) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const data = await LeaveRequest.aggregate([
      {
        $match: {
          status:    'approved',
          startDate: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id:       '$leaveType',
          totalDays: { $sum: '$numberOfDays' }
        }
      },
      { $sort: { totalDays: -1 } }
    ]);

    res.status(200).json({ success: true, data: data.map(d => ({ name: d._id, value: d.totalDays })) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route GET /api/analytics/attendance-rate (Admin/HR)
// (present days / total working days) * 100 per dept
// ─────────────────────────────────────────────
export const getAttendanceRate = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Compute working days (Mon-Fri) in current month
    let workingDays = 0;
    for (let d = new Date(startOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }
    if (workingDays === 0) workingDays = 1; // avoid division by zero

    const stats = await SwipeRecord.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: today },
          employee: { $exists: true, $ne: null } // Defensive: Ignore records without employees
        }
      },
      {
        $group: {
          _id: '$employee',
          presentDays: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'present'] }, 1, 
                { $cond: [{ $eq: ['$status', 'half_day'] }, 0.5, 0] }
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$user.department', 'unassigned'] },
          avgPresentDays: { $avg: '$presentDays' }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          department: { $ifNull: ['$dept.name', 'Unassigned'] },
          rate: {
            $round: [
              { 
                $multiply: [
                  { 
                    $divide: [
                      { $convert: { input: { $ifNull: ['$avgPresentDays', 0] }, to: 'double', onError: 0, onNull: 0 } }, 
                      workingDays
                    ] 
                  }, 
                  100
                ] 
              }, 
              1
            ]
          }
        }
      },
      { $sort: { rate: -1 } }
    ]);

    res.status(200).json({ success: true, workingDays, data: stats });
  } catch (error) {
    console.error('[Analytics] Attendance Rate Error:', error.message);
    // On 500, return a success with empty data so the dashboard doesn't crash
    res.status(200).json({ success: true, message: 'Failsafe: error calculating rate', data: [] });
  }
};

// ─────────────────────────────────────────────
// @route GET /api/analytics/birthdays (Admin)
// Employees with birthday or work anniversary this month
// ─────────────────────────────────────────────
export const getBirthdayAnniversaries = async (req, res, next) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const employees = await User.find({
      role: 'employee',
      isActive: true,
      $or: [
        { dateOfBirth: { $exists: true, $ne: null } },
        { joiningDate: { $exists: true, $ne: null } }
      ]
    }).select('name avatar dateOfBirth joiningDate department').populate('department', 'name');

    const result = [];
    employees.forEach(emp => {
      if (emp.dateOfBirth) {
        const m = new Date(emp.dateOfBirth).getMonth() + 1;
        if (m === currentMonth) {
          result.push({
            _id: emp._id,
            name: emp.name,
            avatar: emp.avatar,
            department: emp.department?.name,
            type: 'birthday',
            date: emp.dateOfBirth,
            day: new Date(emp.dateOfBirth).getDate()
          });
        }
      }
      if (emp.joiningDate) {
        const m = new Date(emp.joiningDate).getMonth() + 1;
        if (m === currentMonth) {
          const years = new Date().getFullYear() - new Date(emp.joiningDate).getFullYear();
          result.push({
            _id: emp._id,
            name: emp.name,
            avatar: emp.avatar,
            department: emp.department?.name,
            type: 'anniversary',
            date: emp.joiningDate,
            day: new Date(emp.joiningDate).getDate(),
            years
          });
        }
      }
    });

    result.sort((a, b) => a.day - b.day);
    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route GET /api/analytics/employee-stats/:id (Admin/HR)
// Detailed leave usage vs balance for one employee
// ─────────────────────────────────────────────
export const getEmployeeStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('name leaveBalance');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    // Aggregate approved leave days by type for this employee
    const usage = await LeaveRequest.aggregate([
      {
        $match: {
          employee:  user._id,
          status:    'approved',
          startDate: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id:       '$leaveType',
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    // Format for frontend consumption
    const stats = Object.keys(user.leaveBalance.toObject()).map(type => {
      const used = usage.find(u => u._id === type)?.totalDays || 0;
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        used,
        remaining: user.leaveBalance[type]
      };
    });

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
