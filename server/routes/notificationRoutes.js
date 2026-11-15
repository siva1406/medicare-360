import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

export default router;
