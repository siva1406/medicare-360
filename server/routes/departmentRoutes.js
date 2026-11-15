import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin-only management
router.post('/', authenticate, authorize('admin'), createDepartment);
router.put('/:id', authenticate, authorize('admin'), updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), deleteDepartment);

export default router;
