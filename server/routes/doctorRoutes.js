import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorAvailability,
  updateAvailability,
  addDoctorLeave,
  getDoctorStats,
  recommendDoctors,
  createDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Public doctor search and directory
router.get('/', getDoctors);

// Smart Doctor Recommendation
router.all('/recommend', recommendDoctors);

// Doctor availability check
router.get('/:id/availability', getDoctorAvailability);

// Doctor details
router.get('/:id', getDoctorById);

// Protected routes (Admin / Doctor)
router.post('/', authenticate, authorize('admin'), createDoctor);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);
router.put('/:id', authenticate, authorize('doctor', 'admin'), updateDoctor);
router.put('/:id/availability', authenticate, authorize('doctor', 'admin'), updateAvailability);
router.post('/:id/leave', authenticate, authorize('doctor', 'admin'), addDoctorLeave);
router.get('/:id/stats', authenticate, authorize('doctor', 'admin'), getDoctorStats);

export default router;
