import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { 
  applyLeave, 
  getMyLeaves, 
  getLeaveBalance,
  getAllLeaves, 
  getPendingApprovals, 
  approveLeave, 
  rejectLeave,
  cancelLeave
} from '../controllers/leaveController.js';

router.use(protect);

// Employee routes
router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/balance', getLeaveBalance);
router.patch('/:id/cancel', cancelLeave);

// HR/Admin routes
router.get('/all',     restrictTo('admin', 'hr'), getAllLeaves);
router.get('/pending', restrictTo('admin', 'hr'), getPendingApprovals);
router.patch('/:id/approve', restrictTo('admin', 'hr'), approveLeave);
router.patch('/:id/reject',  restrictTo('admin', 'hr'), rejectLeave);

export default router;
