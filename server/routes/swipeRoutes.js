import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { getMySwipeData, getSwipeStats, requestRegularization } from '../controllers/swipeController.js';

router.use(protect);

router.get('/my', getMySwipeData);
router.get('/stats', getSwipeStats);
router.post('/regularize', requestRegularization);

export default router;
