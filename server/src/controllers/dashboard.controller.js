const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary stats
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary(req.user._id);
  ApiResponse.ok(summary, 'Dashboard summary retrieved').send(res);
});

module.exports = { getSummary };
