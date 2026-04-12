import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
