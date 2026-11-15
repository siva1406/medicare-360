import express from 'express';
import {
  getPatients,
  getPatientProfile,
  updatePatientProfile,
  getMedicalTimeline
} from '../controllers/patientController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// Get all patients with search and pagination (Receptionists, Doctors, Admins)
router.get('/', authorize('doctor', 'receptionist', 'admin'), getPatients);

// Get single patient profile (Patient views own; Doctors, Receptionists, Admins can view)
router.get('/:id', authorize('patient', 'doctor', 'receptionist', 'admin'), getPatientProfile);

// Update patient profile (Patient updates own; Admin updates any)
router.put('/:id', authorize('patient', 'admin'), updatePatientProfile);

// Medical timeline
router.get('/:id/history', authorize('patient', 'doctor', 'receptionist', 'admin'), getMedicalTimeline);

export default router;
