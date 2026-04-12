import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getHolidays, addHoliday, deleteHoliday } from '../controllers/holidayController.js';

router.use(protect);

router.get('/', getHolidays);
router.post('/', restrictTo('admin'), addHoliday);
router.delete('/:id', restrictTo('admin'), deleteHoliday);

export default router;
