import SwipeRecord from '../models/SwipeRecord.js';

// @route GET /api/swipe/my
export const getMySwipeData = async (req, res, next) => {
  try {
    const records = await SwipeRecord.find({ employee: req.user._id }).sort('-date');
    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/swipe/stats
export const getSwipeStats = async (req, res, next) => {
  try {
    // Generate placeholder stats mapping to the Reference image "Swipe Data.jpg"
    // In production, aggregate from SwipeRecord
    res.status(200).json({
      success: true,
      stats: {
        avgInTime: '9:16 AM',
        avgBreakTime: '45m',
        avgWorkTime: '7h 33m',
        avgOutTime: '6:15 PM'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/swipe/regularize
export const requestRegularization = async (req, res, next) => {
  try {
    const { recordId, reason } = req.body;
    const record = await SwipeRecord.findById(recordId);

    if (!record || record.employee.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    record.regularizeRequest = {
      requested: true,
      reason
    };
    await record.save();

    res.status(200).json({ success: true, message: 'Regularization requested successfully', record });
  } catch (error) {
    next(error);
  }
};
