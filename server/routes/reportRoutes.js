import express from 'express';
import {
  uploadReport,
  getReports,
  downloadReport
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

// Upload report
router.post(
  '/',
  authorize('patient', 'doctor', 'receptionist', 'admin'),
  upload.single('file'),
  uploadReport
);

// View reports list
router.get('/', authorize('patient', 'doctor', 'receptionist', 'admin'), getReports);

// Download report file
router.get('/:id/download', authorize('patient', 'doctor', 'receptionist', 'admin'), downloadReport);

export default router;
