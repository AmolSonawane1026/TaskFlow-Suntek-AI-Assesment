const summaryService = require('../services/summary.service');
const ApiResponse = require('../utils/ApiResponse');

class SummaryController {
  /**
   * GET /api/summary/daily?date=YYYY-MM-DD
   */
  async getDailySummary(req, res, next) {
    try {
      const { date } = req.query;
      const summary = await summaryService.getDailySummary(req.user.userId, date);
      return ApiResponse.success(res, { summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/summary/ai?date=YYYY-MM-DD
   * Returns AI-generated productivity summary, score, and coaching insights
   */
  async getAiSummary(req, res, next) {
    try {
      const { date } = req.query;
      const data = await summaryService.getAiDailyInsights(req.user.userId, date);
      return ApiResponse.success(res, data, 'AI summary generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/summary/weekly
   */
  async getWeeklySummary(req, res, next) {
    try {
      const summary = await summaryService.getWeeklySummary(req.user.userId);
      return ApiResponse.success(res, { summary });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SummaryController();
