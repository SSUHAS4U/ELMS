import AuditLog from '../models/AuditLog.js';

// @route GET /api/audit-log  (Admin only)
// Paginated, filterable audit log
export const getAuditLog = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, actorId } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (actorId) filter.actor = actorId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actor', 'name email role')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/audit-log/actions  (Admin only)
// Returns distinct action types for the filter dropdown
export const getDistinctActions = async (req, res, next) => {
  try {
    const actions = await AuditLog.distinct('action');
    res.status(200).json({ success: true, actions: actions.sort() });
  } catch (error) {
    next(error);
  }
};
