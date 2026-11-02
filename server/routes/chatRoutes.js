import express from 'express';
import { getCustomerChatThread, sendCustomerMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/thread', requireAuth, getCustomerChatThread);
router.post('/message', requireAuth, sendCustomerMessage);

export default router;
