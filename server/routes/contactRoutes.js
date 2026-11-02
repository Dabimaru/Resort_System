import express from 'express';
import { createInquiry, listInquiries } from '../controllers/contactController.js';

const router = express.Router();

router.get('/', listInquiries);
router.post('/', createInquiry);

export default router;
