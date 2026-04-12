import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getAuditLog, getDistinctActions } from '../controllers/auditLogController.js';

router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getAuditLog);
router.get('/actions', getDistinctActions);

export default router;
