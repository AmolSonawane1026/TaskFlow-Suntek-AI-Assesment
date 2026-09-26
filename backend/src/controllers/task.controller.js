const taskService = require('../services/task.service');
const ApiResponse = require('../utils/ApiResponse');

class TaskController {
  /**
   * POST /api/tasks
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.userId, req.body);
      return ApiResponse.created(res, { task }, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks
   */
  async getTasks(req, res, next) {
    try {
      const { status, priority, search, page, limit } = req.query;
      const result = await taskService.getTasks(req.user.userId, {
        status,
        priority,
        search,
        page,
        limit,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:id
   */
  async getTask(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.user.userId, req.params.id);
      return ApiResponse.success(res, { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(
        req.user.userId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:id
   */
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.user.userId, req.params.id);
      return ApiResponse.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/enhance
   */
  async enhanceTask(req, res, next) {
    try {
      const result = await taskService.enhanceTask(req.body.input);
      return ApiResponse.success(res, result, 'Task enhanced successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
