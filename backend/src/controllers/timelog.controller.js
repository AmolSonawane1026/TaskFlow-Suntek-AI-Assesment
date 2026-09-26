const timeLogService = require('../services/timelog.service');
const ApiResponse = require('../utils/ApiResponse');

class TimeLogController {
  /**
   * POST /api/timelogs/start
   */
  async startTimer(req, res, next) {
    try {
      const timeLog = await timeLogService.startTimer(
        req.user.userId,
        req.body.taskId
      );
      return ApiResponse.created(res, { timeLog }, 'Timer started');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/timelogs/stop
   */
  async stopTimer(req, res, next) {
    try {
      const timeLog = await timeLogService.stopTimer(
        req.user.userId,
        req.body.timeLogId
      );
      return ApiResponse.success(res, { timeLog }, 'Timer stopped');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/timelogs/active
   */
  async getActiveTimer(req, res, next) {
    try {
      const activeTimer = await timeLogService.getActiveTimer(req.user.userId);
      return ApiResponse.success(res, { activeTimer });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/timelogs
   */
  async getTimeLogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await timeLogService.getTimeLogs(req.user.userId, {
        page,
        limit,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/timelogs/task/:taskId
   */
  async getTaskTimeLogs(req, res, next) {
    try {
      const result = await timeLogService.getTaskTimeLogs(
        req.user.userId,
        req.params.taskId
      );
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TimeLogController();
