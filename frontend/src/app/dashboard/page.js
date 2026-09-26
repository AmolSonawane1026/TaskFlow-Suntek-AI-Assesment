'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDailySummary, fetchWeeklySummary, fetchAiSummary } from '@/store/slices/summarySlice';
import { fetchTasks } from '@/store/slices/taskSlice';
import { fetchActiveTimer } from '@/store/slices/timelogSlice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import TaskCard from '@/components/tasks/TaskCard';
import { formatTime } from '@/utils/helpers';
import Link from 'next/link';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
  RefreshCw,
  Target,
  Trophy,
  Lightbulb,
  Plus,
  ArrowRight,
  Inbox,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { dailySummary, weeklySummary, aiInsights, isAiLoading } = useSelector((state) => state.summary);
  const { tasks } = useSelector((state) => state.tasks);
  const { activeTimer } = useSelector((state) => state.timelogs);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeElapsed, setActiveElapsed] = useState(0);

  // Live real-time tick for currently active timer so stats update in real time
  useEffect(() => {
    if (!activeTimer?.startTime) {
      setActiveElapsed(0);
      return;
    }

    const calcElapsed = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const now = Date.now();
      setActiveElapsed(Math.max(0, Math.floor((now - start) / 1000)));
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  useEffect(() => {
    dispatch(fetchDailySummary());
    dispatch(fetchWeeklySummary());
    dispatch(fetchAiSummary());
    dispatch(fetchTasks({ limit: 6 }));
    dispatch(fetchActiveTimer());
  }, [dispatch]);

  const handleRefreshAi = () => {
    dispatch(fetchAiSummary());
  };

  // Weekly chart data (Warm Orange Theme)
  const weeklyChartData = {
    labels: weeklySummary?.dailyBreakdown?.map((d) => d.dayName) || [],
    datasets: [
      {
        label: 'Hours Tracked',
        data: weeklySummary?.dailyBreakdown?.map((d) => +(d.totalTime / 3600).toFixed(1)) || [],
        backgroundColor: 'rgba(225, 26, 69, 0.85)',
        borderColor: '#E11A45',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.raw} hours`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 12 }, color: '#9ca3af' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: '#9ca3af' },
      },
    },
  };

  // Status doughnut chart (Emerald, #E11A45, Amber)
  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [
          dailySummary?.statusBreakdown?.completed || 0,
          dailySummary?.statusBreakdown?.inProgress || 0,
          dailySummary?.statusBreakdown?.pending || 0,
        ],
        backgroundColor: ['#10b981', '#E11A45', '#f59e0b'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const realtimeTrackedToday =
    (dailySummary?.totalTimeTracked || 0) + (activeTimer ? activeElapsed : 0);

  const summaryCards = [
    {
      label: 'Total Tasks',
      value: dailySummary?.totalTasks || 0,
      icon: ListTodo,
      iconColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
    },
    {
      label: 'Completed Today',
      value: dailySummary?.completedToday || 0,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
    },
    {
      label: 'Time Tracked Today',
      value: formatTime(realtimeTrackedToday),
      icon: Clock,
      iconColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
    },
    {
      label: 'Tasks Worked On',
      value: dailySummary?.tasksWorkedOnToday || 0,
      icon: Flame,
      iconColor: 'text-red-500',
      bgLight: 'bg-orange-50',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${activeTimer ? 'pt-14 sm:pt-16 pb-8' : 'py-8'}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5" suppressHydrationWarning>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Task
            </button>
          </div>

          {/* Visual Hero Banner with Image */}
          <div className="relative rounded-3xl overflow-hidden mb-8 shadow-md border-2 border-orange-500 bg-gray-900 text-white">
            <div className="absolute inset-0">
              <img
                src="/dashboard-banner.jpg"
                alt="Productivity Dashboard Analytics"
                className="w-full h-full object-cover object-right opacity-30 hover:opacity-40 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gray-900/80"></div>
            </div>

            <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold mb-3 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Smart Workspace Enabled
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Focus on what truly matters.
                </h2>
                <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                  Plan tasks seamlessly, automate breakdown with Gemini AI, and track deep work hours with precision.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-900/30 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Create Task with AI
                  </button>
                  <Link
                    href="/timelogs"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-orange-300" />
                    View Time Logs
                  </Link>
                </div>
              </div>

              {/* Floating Mini Engine Badge */}
              <div className="hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xs shadow-xl">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-orange-400/40">
                  <img src="/logo.jpg" alt="TaskFlow" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">TaskFlow Engine</p>
                  <p className="text-[11px] text-orange-200 mt-0.5">Gemini 2.5 Flash active</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-300 font-medium">Ready for input</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 ${card.bgLight} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <IconComp className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{card.value}</p>
                  <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide">{card.label}</p>
                </div>
              );
            })}
          </div>

          {/* Google Gemini AI Daily Productivity Summary Card */}
          <div className="bg-orange-50 rounded-3xl p-6 sm:p-7 border border-orange-200 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-bold shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                        Gemini AI Daily Productivity Summary
                      </h2>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full border border-orange-200">
                        AI Coach
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Real-time intelligent analysis of today&apos;s output, momentum, and pacing
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefreshAi}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-orange-700 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                  {isAiLoading ? 'Generating...' : 'Refresh AI Summary'}
                </button>
              </div>

              {isAiLoading ? (
                <div className="py-8 flex items-center justify-center gap-3 text-orange-700 font-semibold text-sm">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing your activity with Google Gemini AI...
                </div>
              ) : aiInsights ? (
                <div className="space-y-4">
                  {/* Headline & Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/80 backdrop-blur rounded-2xl border border-orange-100 shadow-xs">
                    <div>
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                        Today&apos;s Momentum
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                        {aiInsights.headline}
                      </h3>
                    </div>
                    {aiInsights.productivityScore !== undefined && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-900 rounded-xl font-bold text-sm border border-orange-200 self-start sm:self-auto">
                        <Target className="w-4 h-4 text-orange-700" />
                        <span>Focus Score:</span>
                        <span className="text-base text-orange-950 font-extrabold">
                          {aiInsights.productivityScore}/100
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Executive Summary */}
                  <p className="text-sm text-gray-700 leading-relaxed bg-white/60 p-4 rounded-2xl border border-orange-100/50">
                    {aiInsights.summary}
                  </p>

                  {/* Highlights & Recommendations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Top Achievement */}
                    {aiInsights.topAchievement && (
                      <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-xs">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Trophy className="w-4 h-4 text-emerald-600" />
                          Top Achievement
                        </p>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {aiInsights.topAchievement}
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {aiInsights.recommendations?.length > 0 && (
                      <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-xs">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Lightbulb className="w-4 h-4 text-orange-600" />
                          Gemini AI Recommendations
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-600">
                          {aiInsights.recommendations.map((tip, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-orange-500 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No AI insights generated yet.</p>
                  <button
                    onClick={handleRefreshAi}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate AI Daily Summary
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Weekly Activity Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
                    <p className="text-xs text-gray-400">Hours logged per day</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
                  Total: {formatTime(weeklySummary?.totalWeeklyTime || 0)}
                </span>
              </div>
              <div className="h-64">
                {weeklySummary?.dailyBreakdown?.length > 0 ? (
                  <Bar data={weeklyChartData} options={weeklyChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No activity data yet. Start tracking time!
                  </div>
                )}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Task Status</h2>
              </div>
              <div className="h-48 flex items-center justify-center">
                {dailySummary?.totalTasks > 0 ? (
                  <Doughnut data={statusChartData} options={statusChartOptions} />
                ) : (
                  <p className="text-gray-400 text-sm">No tasks yet</p>
                )}
              </div>
              {dailySummary?.totalTasks > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-600 font-medium">Completed</span>
                    </div>
                    <span className="font-bold text-gray-900">{dailySummary?.statusBreakdown?.completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-gray-600 font-medium">In Progress</span>
                    </div>
                    <span className="font-bold text-gray-900">{dailySummary?.statusBreakdown?.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-gray-600 font-medium">Pending</span>
                    </div>
                    <span className="font-bold text-gray-900">{dailySummary?.statusBreakdown?.pending}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Today's Task Breakdown */}
          {dailySummary?.taskTimeBreakdown?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Today&apos;s Time Breakdown</h2>
              <div className="space-y-3">
                {dailySummary.taskTimeBreakdown.map((item) => (
                  <div key={item.task._id} className="flex items-center justify-between p-3.5 bg-orange-50/30 border border-orange-100/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-semibold text-gray-900">{item.task.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{item.sessions} session{item.sessions !== 1 ? 's' : ''}</span>
                      <span className="text-sm font-bold text-orange-600">{formatTime(item.timeSpent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tasks */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Tasks</h2>
              <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-orange-600 font-bold hover:text-orange-700 cursor-pointer">
                View all tasks
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.slice(0, 6).map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center shadow-xs">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-8 h-8" />
                </div>
                <p className="text-gray-500 mb-4 text-sm font-medium">No tasks yet. Create your first task to get started!</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md shadow-orange-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            )}
          </div>
        </main>

        <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
