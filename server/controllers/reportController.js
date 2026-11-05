import { buildReportSummary } from '../services/reportService.js';

export const getReportSummaryController = async (req, res) => {
  const summary = await buildReportSummary(req.query || {});
  return res.status(200).json({
    message: 'Report summary retrieved successfully.',
    report: summary,
  });
};
