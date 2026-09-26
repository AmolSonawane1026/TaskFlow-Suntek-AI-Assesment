'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask, fetchTasks } from '@/store/slices/taskSlice';
import { fetchDailySummary, fetchWeeklySummary } from '@/store/slices/summarySlice';
import { startTimer, stopTimer } from '@/store/slices/timelogSlice';
import {
  getStatusColor,
  getPriorityColor,
  getStatusLabel,
  formatTime,
  getRelativeTime,
  formatDateTime,
} from '@/utils/helpers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Pencil,
  Trash2,
  Play,
  Square,
  CheckCircle2,
  RotateCcw,
  Clock,
  Radio,
  X,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';

const editTaskValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .max(200, 'Title cannot exceed 200 characters')
    .required('Task title is required'),
  description: Yup.string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters'),
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority')
    .required('Priority is required'),
  status: Yup.string()
    .oneOf(['pending', 'in-progress', 'completed'], 'Invalid status')
    .required('Status is required'),
});

export default function TaskCard({ task }) {
  const dispatch = useDispatch();
  const { activeTimer } = useSelector((state) => state.timelogs);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const editFormik = useFormik({
    initialValues: {
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
    },
    enableReinitialize: true,
    validationSchema: editTaskValidationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(updateTask({ id: task._id, data: values })).unwrap();
        toast.success('Task updated successfully');
        setIsEditOpen(false);
        dispatch(fetchDailySummary());
        dispatch(fetchWeeklySummary());
      } catch (error) {
        toast.error(error || 'Failed to update task');
      }
    },
  });

  const handleStartTimer = async (e) => {
    if (e) e.stopPropagation();
    try {
      await dispatch(startTimer(task._id)).unwrap();
      toast.success('Timer started');
      dispatch(fetchTasks());
      dispatch(fetchDailySummary());
      dispatch(fetchWeeklySummary());
    } catch (error) {
      toast.error(error || 'Failed to start timer');
    }
  };

  const handleStopTimer = async (e) => {
    if (e) e.stopPropagation();
    if (!activeTimer?._id) return;
    try {
      await dispatch(stopTimer(activeTimer._id)).unwrap();
      toast.success('Timer stopped');
      dispatch(fetchDailySummary());
      dispatch(fetchWeeklySummary());
      dispatch(fetchTasks());
    } catch (error) {
      toast.error(error || 'Failed to stop timer');
    }
  };

  const handleStatusChange = async (newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      await dispatch(updateTask({ id: task._id, data: { status: newStatus } })).unwrap();
      toast.success(`Task marked as ${getStatusLabel(newStatus)}`);
      dispatch(fetchDailySummary());
      dispatch(fetchWeeklySummary());
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteWithSweetAlert = async (e) => {
    if (e) e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete Task?',
      html: `Are you sure you want to delete <b class="text-orange-600">"${task.title}"</b>?<br/><span class="text-sm text-gray-500">This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11A45',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl p-6 font-sans',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md cursor-pointer',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer',
      },
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteTask(task._id)).unwrap();
        toast.success('Task deleted successfully');
        setIsDetailOpen(false);
        setIsEditOpen(false);
        dispatch(fetchDailySummary());
        dispatch(fetchWeeklySummary());
      } catch (error) {
        toast.error(error || 'Failed to delete task');
      }
    }
  };

  const isTimerActiveForThisTask = activeTimer?.task?._id === task._id || activeTimer?.task === task._id;

  return (
    <>
      {/* Task Card on List / Grid */}
      <div
        onClick={() => setIsDetailOpen(true)}
        className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-orange-200 hover:shadow-md transition-all duration-200 group cursor-pointer ${
          task.status === 'completed' ? 'opacity-80' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3
              className={`font-bold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors ${
                task.status === 'completed' ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Quick Actions (Hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditOpen(true);
              }}
              className="p-1.5 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-lg transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => handleDeleteWithSweetAlert(e)}
              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.totalTimeSpent > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
              <Clock className="w-3 h-3 text-orange-600" />
              {formatTime(task.totalTimeSpent)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-medium">{getRelativeTime(task.createdAt)}</span>

          <div className="flex items-center gap-2">
            {/* Status Quick Actions */}
            {task.status !== 'completed' && (
              <button
                type="button"
                onClick={(e) => handleStatusChange('completed', e)}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </button>
            )}
            {task.status === 'completed' && (
              <button
                type="button"
                onClick={(e) => handleStatusChange('pending', e)}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold hover:bg-amber-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen
              </button>
            )}

            {/* Timer Button */}
            {task.status !== 'completed' && (
              isTimerActiveForThisTask ? (
                <button
                  type="button"
                  onClick={(e) => handleStopTimer(e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-emerald-100 hover:bg-red-50 text-emerald-700 hover:text-red-600 border border-emerald-200 hover:border-red-200 group/timer cursor-pointer active:scale-95"
                  title="Click to Stop Timer"
                >
                  <Square className="w-3 h-3 fill-current text-emerald-600 group-hover/timer:text-red-600" />
                  <span className="group-hover/timer:hidden">Tracking</span>
                  <span className="hidden group-hover/timer:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleStartTimer(e)}
                  disabled={!!activeTimer}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTimer
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 active:scale-95'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current text-orange-600" />
                  Start Timer
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 1. Task Details Popup Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsDetailOpen(false)}
          />

          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-orange-100 p-6 md:p-7 z-10 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                  {isTimerActiveForThisTask && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 animate-pulse">
                      <Radio className="w-3 h-3 text-emerald-600" />
                      Active Timer
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug pt-1">
                  {task.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="p-2 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-5">
              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-orange-600" />
                  Description
                </label>
                <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {task.description ? (
                    task.description
                  ) : (
                    <span className="text-gray-400 italic">No description provided for this task.</span>
                  )}
                </div>
              </div>

              {/* Task Details / Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 bg-orange-50/50 border border-orange-100/60 rounded-2xl p-4">
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block">Total Time Spent</span>
                  <span className="text-sm font-bold text-gray-900 inline-flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    {formatTime(task.totalTimeSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block">Created On</span>
                  <span className="text-sm font-bold text-gray-900 inline-flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    {formatDateTime(task.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block">Last Activity</span>
                  <span className="text-sm font-bold text-gray-900 block mt-0.5">
                    {getRelativeTime(task.updatedAt || task.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => handleDeleteWithSweetAlert(e)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Complete / Reopen */}
                {task.status !== 'completed' ? (
                  <button
                    type="button"
                    onClick={(e) => handleStatusChange('completed', e)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Complete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleStatusChange('pending', e)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    Reopen
                  </button>
                )}

                {/* Start / Stop Timer in Detail Modal */}
                {task.status !== 'completed' && (
                  isTimerActiveForThisTask ? (
                    <button
                      type="button"
                      onClick={(e) => handleStopTimer(e)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all bg-emerald-100 hover:bg-red-50 text-emerald-700 hover:text-red-600 border border-emerald-200 hover:border-red-200 cursor-pointer active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-current text-emerald-600 hover:text-red-600" />
                      Stop Timer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleStartTimer(e)}
                      disabled={!!activeTimer}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        activeTimer
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 active:scale-95'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current text-orange-600" />
                      Start Timer
                    </button>
                  )
                )}

                {/* Edit Button -> Opens Edit Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsEditOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-sm font-bold shadow-md shadow-orange-200 transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Task Popup Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => {
              editFormik.resetForm();
              setIsEditOpen(false);
            }}
          />

          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-orange-100 p-6 md:p-7 z-10 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
                <p className="text-xs text-gray-500 mt-0.5">Update task information and save changes</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  editFormik.resetForm();
                  setIsEditOpen(false);
                }}
                className="p-2 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={editFormik.handleSubmit} className="py-5 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormik.values.title}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                    editFormik.touched.title && editFormik.errors.title
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-500'
                  }`}
                  placeholder="Task title"
                />
                {editFormik.touched.title && editFormik.errors.title && (
                  <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {editFormik.errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormik.values.description}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                    editFormik.touched.description && editFormik.errors.description
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-500'
                  }`}
                  rows={4}
                  placeholder="Enter full task details..."
                />
                {editFormik.touched.description && editFormik.errors.description && (
                  <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {editFormik.errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={editFormik.values.priority}
                    onChange={editFormik.handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormik.values.status}
                    onChange={editFormik.handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    editFormik.resetForm();
                    setIsEditOpen(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editFormik.isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 cursor-pointer"
                >
                  {editFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

