import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { 
  getSummary, 
  getDepartmentStats, 
  getLeaveTrends,
  getLeaveTypeDistribution,
  getAttendanceRate,
  getBirthdayAnniversaries
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'hr'));

router.get('/summary',        getSummary);
router.get('/department',     getDepartmentStats);
router.get('/trends',         getLeaveTrends);
router.get('/leave-types',    getLeaveTypeDistribution);
router.get('/attendance',     getAttendanceRate);
router.get('/birthdays',      getBirthdayAnniversaries);

export default router;
