import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { createUser, getAllUsers, getManagers, deleteUser, reactivateUser, updateUser, hardDeleteUser } from '../controllers/userController.js';

// All user routes require authentication
router.use(protect);

router.get('/managers', getManagers);
router.get('/', restrictTo('admin', 'hr'), getAllUsers);
router.post('/create', restrictTo('admin'), createUser);
router.put('/:id', restrictTo('admin'), updateUser);
router.patch('/:id/reactivate', restrictTo('admin'), reactivateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);
router.delete('/:id/permanent', restrictTo('admin'), hardDeleteUser);

export default router;
