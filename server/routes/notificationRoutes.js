import express from 'express';
import { createNotificationController, listNotificationsController } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', listNotificationsController);
router.post('/', createNotificationController);

export default router;
