import { buildReportSummary } from '../services/reportService.js';

export const getReportSummaryController = (req, res) => {
  const summary = buildReportSummary(req.query || {});
  return res.status(200).json({
    message: 'Report summary retrieved successfully.',
    report: summary,
  });
};
