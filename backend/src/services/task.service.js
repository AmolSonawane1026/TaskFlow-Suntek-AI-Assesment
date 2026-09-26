const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const AppError = require('../utils/AppError');

class TaskService {
  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    const task = await Task.create({
      ...taskData,
      user: userId,
    });
    return task;
  }

  /**
   * Get all tasks for a user with optional filtering
   */
  async getTasks(userId, { status, priority, search, page = 1, limit = 20 }) {
    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single task by ID (user-scoped)
   */
  async getTaskById(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  /**
   * Update a task (user-scoped)
   */
  async updateTask(userId, taskId, updateData) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  /**
   * Delete a task and associated time logs (user-scoped)
   */
  async deleteTask(userId, taskId) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Clean up associated time logs
    await TimeLog.deleteMany({ task: taskId, user: userId });

    return task;
  }

  /**
   * Enhance task using Google Gemini AI API
   */
  async enhanceTask(input) {
    const aiService = require('./ai.service');
    return aiService.enhanceTask(input);
  }
}

module.exports = new TaskService();
