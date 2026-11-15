import express from 'express';
import {
  getAdminStats,
  getAdminAnalytics,
  exportReports
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/analytics', getAdminAnalytics);
router.get('/reports/export', exportReports);

export default router;
