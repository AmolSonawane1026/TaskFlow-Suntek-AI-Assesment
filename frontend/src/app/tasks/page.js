'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, enhanceTask } from '@/store/slices/taskSlice';
import { fetchDailySummary, fetchWeeklySummary } from '@/store/slices/summarySlice';
import { fetchActiveTimer } from '@/store/slices/timelogSlice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import toast from 'react-hot-toast';
import { Plus, Sparkles, Search, Inbox, Wand2 } from 'lucide-react';

export default function TasksPage() {
  const dispatch = useDispatch();
  const { tasks, isLoading, pagination } = useSelector((state) => state.tasks);
  const { activeTimer } = useSelector((state) => state.timelogs);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    dispatch(fetchActiveTimer());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    dispatch(fetchTasks(params));
  }, [dispatch, filters]);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '' });
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsQuickCreating(true);
    try {
      const aiResult = await dispatch(enhanceTask(quickInput)).unwrap();
      const taskData = {
        title: aiResult.title || quickInput,
        description: aiResult.description || '',
        priority: aiResult.priority || 'medium',
        status: 'pending',
      };
      await dispatch(createTask(taskData)).unwrap();
      toast.success(`Created: "${taskData.title}"`);
      setQuickInput('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      dispatch(fetchTasks(params));
      dispatch(fetchDailySummary());
      dispatch(fetchWeeklySummary());
    } catch (error) {
      toast.error(error || 'Failed to create task with AI');
    } finally {
      setIsQuickCreating(false);
    }
  };

  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${activeTimer ? 'pt-14 sm:pt-16 pb-8' : 'py-8'}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tasks</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {pagination?.total || 0} total tasks in your workspace
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Task Modal
            </button>
          </div>

          {/* Natural Language AI Quick Task Creator */}
          <div className="bg-orange-500 rounded-3xl p-5 sm:p-6 mb-6 text-white shadow-lg shadow-orange-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Natural Language Task Creator
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-white/20 backdrop-blur rounded-full text-white">
                  Gemini AI
                </span>
              </div>
              <span className="text-xs text-orange-100 hidden sm:inline font-medium">
                Type naturally, e.g. &quot;follow up with designer&quot;
              </span>
            </div>

            <form onSubmit={handleQuickCreate} className="flex gap-2.5">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder='Type a task in plain English (e.g. "follow up with designer")...'
                className="flex-1 px-4 py-3 bg-white text-gray-900 rounded-2xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white shadow-inner font-medium"
              />
              <button
                type="submit"
                disabled={isQuickCreating || !quickInput.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl text-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md whitespace-nowrap cursor-pointer active:scale-95"
              >
                {isQuickCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    Create with AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search tasks by title or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[140px] cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[140px] cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Clear Filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Task List */}
          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center shadow-xs">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
              </h3>
              <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
                {hasFilters
                  ? 'Try adjusting your filters or search query.'
                  : 'Type a task in the AI bar above (e.g. "follow up with designer") or click below.'}
              </p>
              {hasFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md shadow-orange-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              )}
            </div>
          )}
        </main>

        <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
