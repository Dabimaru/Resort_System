import express from 'express';
import { createNotificationController, listNotificationsController } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, listNotificationsController);
router.post('/', createNotificationController);

export default router;
