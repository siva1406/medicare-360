import express from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment
} from '../controllers/appointmentController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Book appointment: Open for online patients, walk-in receptionists, admins, and guest users
router.post('/', optionalAuthenticate, createAppointment);

// All subsequent routes require authentication
router.use(authenticate);

// View appointments (scoping handled per role in controller)
router.get('/', authorize('patient', 'doctor', 'receptionist', 'admin'), getAppointments);

// Update status (Doctor, Receptionist, Admin, or Patient for self-cancellation)
router.patch('/:id/status', authorize('patient', 'doctor', 'receptionist', 'admin'), updateAppointmentStatus);
router.put('/:id/status', authorize('patient', 'doctor', 'receptionist', 'admin'), updateAppointmentStatus);

// Cancel appointment (Patient, Receptionist, Admin)
router.patch('/:id/cancel', authorize('patient', 'receptionist', 'admin'), cancelAppointment);
router.put('/:id/cancel', authorize('patient', 'receptionist', 'admin'), cancelAppointment);

// Reschedule appointment (Patient, Receptionist, Admin)
router.patch('/:id/reschedule', authorize('patient', 'receptionist', 'admin'), rescheduleAppointment);

export default router;
