import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../controllers/leaveTypeController.js';

router.use(protect);

// All authenticated users can GET leave types
router.get('/', getLeaveTypes);

// Admin-only mutations
router.post('/',     restrictTo('admin'), createLeaveType);
router.put('/:id',   restrictTo('admin'), updateLeaveType);
router.delete('/:id',restrictTo('admin'), deleteLeaveType);

export default router;
