import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getPrescriptionPdf
} from '../controllers/prescriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// Doctor creates prescription
router.post('/', authorize('doctor', 'admin'), createPrescription);

// View prescriptions (role filtered)
router.get('/', authorize('patient', 'doctor', 'receptionist', 'admin'), getPrescriptions);

// View single prescription details
router.get('/:id', authorize('patient', 'doctor', 'receptionist', 'admin'), getPrescriptionById);

// Download professional PDF
router.get('/:id/pdf', authorize('patient', 'doctor', 'receptionist', 'admin'), getPrescriptionPdf);

export default router;
