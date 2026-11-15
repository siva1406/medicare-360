import express from 'express';
import {
  createBill,
  getBills,
  recordPayment,
  getInvoicePdf
} from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// Generate bill (Receptionist, Admin)
router.post('/', authorize('receptionist', 'admin'), createBill);

// View bills (Patient sees own; Receptionist & Admin see all)
router.get('/', authorize('patient', 'receptionist', 'admin'), getBills);

// Record payment (Receptionist, Admin)
router.patch('/:id/pay', authorize('receptionist', 'admin'), recordPayment);
router.put('/:id/pay', authorize('receptionist', 'admin'), recordPayment);

// Download PDF invoice
router.get('/:id/invoice', authorize('patient', 'receptionist', 'admin'), getInvoicePdf);

export default router;
