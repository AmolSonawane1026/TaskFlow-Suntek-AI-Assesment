const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const AppError = require('../utils/AppError');

class SummaryService {
  /**
   * Get daily summary for a specific date
   */
  async getDailySummary(userId, date) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get time logs for the day
    const dayTimeLogs = await TimeLog.find({
      user: userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).populate('task', 'title status priority');

    // Get unique tasks worked on today
    const taskIds = [...new Set(dayTimeLogs.map((log) => log.task?._id?.toString()).filter(Boolean))];

    // Get tasks that were worked on today
    const tasksWorkedOn = await Task.find({
      _id: { $in: taskIds },
      user: userId,
    });

    // Calculate total time tracked today
    const totalTimeTracked = dayTimeLogs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0
    );

    // Get all user tasks for status breakdown
    const allTasks = await Task.find({ user: userId });

    // Count tasks by status
    const completedTasks = allTasks.filter((t) => t.status === 'completed');
    const inProgressTasks = allTasks.filter((t) => t.status === 'in-progress');
    const pendingTasks = allTasks.filter((t) => t.status === 'pending');

    // Tasks completed today (updated today with completed status)
    const completedToday = allTasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.updatedAt >= startOfDay &&
        t.updatedAt <= endOfDay
    );

    // Per-task time breakdown for today
    const taskTimeBreakdown = [];
    for (const task of tasksWorkedOn) {
      const taskLogs = dayTimeLogs.filter(
        (log) => log.task?._id?.toString() === task._id.toString()
      );
      const timeSpent = taskLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      taskTimeBreakdown.push({
        task: {
          _id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
        },
        timeSpent,
        sessions: taskLogs.length,
      });
    }

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalTimeTracked,
      totalTasks: allTasks.length,
      tasksWorkedOnToday: tasksWorkedOn.length,
      completedToday: completedToday.length,
      statusBreakdown: {
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length,
      },
      taskTimeBreakdown,
    };
  }

  /**
   * Get AI-generated daily productivity summary and coach insights
   */
  async getAiDailyInsights(userId, date) {
    const summary = await this.getDailySummary(userId, date);
    const aiService = require('./ai.service');
    const insights = await aiService.generateDailySummaryInsights(summary);
    return {
      summary,
      insights,
    };
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(userId) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Get time logs for the past 7 days
    const weekTimeLogs = await TimeLog.find({
      user: userId,
      startTime: { $gte: weekAgo },
      isActive: false,
    }).populate('task', 'title status');

    // Group by day
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayLogs = weekTimeLogs.filter(
        (log) => log.startTime >= dayStart && log.startTime <= dayEnd
      );

      const totalTime = dayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const uniqueTasks = [...new Set(dayLogs.map((l) => l.task?._id?.toString()).filter(Boolean))];

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        totalTime,
        tasksWorkedOn: uniqueTasks.length,
        sessions: dayLogs.length,
      });
    }

    const totalWeeklyTime = weekTimeLogs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0
    );

    return {
      totalWeeklyTime,
      totalSessions: weekTimeLogs.length,
      dailyBreakdown,
    };
  }
}

module.exports = new SummaryService();
