import express from 'express';
import { getReportSummaryController } from '../controllers/reportController.js';

const router = express.Router();

router.get('/summary', getReportSummaryController);

export default router;
