import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getDepartments, getDepartmentEmployees, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';

router.use(protect);

router.get('/', getDepartments);
router.get('/:id/employees', restrictTo('admin', 'hr'), getDepartmentEmployees);

router.post('/',    restrictTo('admin'), createDepartment);
router.put('/:id',  restrictTo('admin'), updateDepartment);
router.delete('/:id', restrictTo('admin'), deleteDepartment);

export default router;
