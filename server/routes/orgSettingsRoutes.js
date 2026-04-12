import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings, seedDefaultSettings } from '../controllers/orgSettingsController.js';

router.use(protect);
router.use(restrictTo('admin'));

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/seed', seedDefaultSettings);

export default router;
