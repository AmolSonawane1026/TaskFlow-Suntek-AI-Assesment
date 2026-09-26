const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');

class TimeLogService {
  /**
   * Start a timer for a task
   */
  async startTimer(userId, taskId) {
    // Verify task belongs to user
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check if user already has an active timer
    const activeTimer = await TimeLog.findOne({ user: userId, isActive: true });
    if (activeTimer) {
      throw new AppError(
        'You already have an active timer. Please stop it before starting a new one.',
        409
      );
    }

    // Create new time log entry
    const timeLog = await TimeLog.create({
      task: taskId,
      user: userId,
      startTime: new Date(),
    });

    // Update task status to in-progress if pending
    if (task.status === 'pending') {
      await Task.findByIdAndUpdate(taskId, { status: 'in-progress' });
    }

    return timeLog;
  }

  /**
   * Stop an active timer
   */
  async stopTimer(userId, timeLogId) {
    const timeLog = await TimeLog.findOne({
      _id: timeLogId,
      user: userId,
      isActive: true,
    });

    if (!timeLog) {
      throw new AppError('Active time log not found', 404);
    }

    timeLog.endTime = new Date();
    await timeLog.save(); // This triggers the pre-save hook to calculate duration

    // Update task's total time spent
    await Task.findByIdAndUpdate(timeLog.task, {
      $inc: { totalTimeSpent: timeLog.duration },
    });

    await timeLog.populate('task', 'title status');

    return timeLog;
  }

  /**
   * Get active timer for current user
   */
  async getActiveTimer(userId) {
    const activeTimer = await TimeLog.findOne({
      user: userId,
      isActive: true,
    }).populate('task', 'title status');

    return activeTimer;
  }

  /**
   * Get all time logs for a user
   */
  async getTimeLogs(userId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const [timeLogs, total] = await Promise.all([
      TimeLog.find({ user: userId })
        .populate('task', 'title status')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      TimeLog.countDocuments({ user: userId }),
    ]);

    return {
      timeLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get time logs for a specific task
   */
  async getTaskTimeLogs(userId, taskId) {
    // Verify task belongs to user
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const timeLogs = await TimeLog.find({
      task: taskId,
      user: userId,
    }).sort({ startTime: -1 });

    const totalTime = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    return {
      timeLogs,
      totalTime,
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
      },
    };
  }
}

module.exports = new TimeLogService();
