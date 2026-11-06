import express from 'express';
import { createInquiry, listInquiries } from '../controllers/contactController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Submitting an inquiry stays public; reading the inbox is staff-only.
router.get('/', requireAuth, requirePermission('inquiries.view'), listInquiries);
router.post('/', createInquiry);

export default router;
