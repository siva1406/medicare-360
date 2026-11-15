import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorAvailability,
  updateAvailability,
  addDoctorLeave,
  getDoctorStats,
  recommendDoctors
} from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Public doctor search and directory
router.get('/', getDoctors);

// Smart Doctor Recommendation
router.get('/recommend', recommendDoctors);

// Doctor availability check
router.get('/:id/availability', getDoctorAvailability);

// Doctor details
router.get('/:id', getDoctorById);

// Protected routes
router.put('/:id', authenticate, authorize('doctor', 'admin'), updateDoctor);
router.put('/:id/availability', authenticate, authorize('doctor', 'admin'), updateAvailability);
router.post('/:id/leave', authenticate, authorize('doctor', 'admin'), addDoctorLeave);
router.get('/:id/stats', authenticate, authorize('doctor', 'admin'), getDoctorStats);

export default router;
