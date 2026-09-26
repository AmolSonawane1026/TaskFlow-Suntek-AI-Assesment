'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, enhanceTask, clearEnhancedTask } from '@/store/slices/taskSlice';
import { fetchDailySummary, fetchWeeklySummary } from '@/store/slices/summarySlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Sparkles, X, Zap, Plus, AlertCircle } from 'lucide-react';

const taskValidationSchema = Yup.object().shape({
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

export default function CreateTaskModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { isEnhancing } = useSelector((state) => state.tasks);
  const [naturalInput, setNaturalInput] = useState('');
  const [isInstantCreating, setIsInstantCreating] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
    },
    validationSchema: taskValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await dispatch(createTask(values)).unwrap();
        toast.success('Task created successfully');
        dispatch(fetchDailySummary());
        dispatch(fetchWeeklySummary());
        resetForm();
        setNaturalInput('');
        dispatch(clearEnhancedTask());
        onClose();
      } catch (error) {
        toast.error(error || 'Failed to create task');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEnhance = async (e) => {
    if (e) e.preventDefault();
    if (!naturalInput.trim()) {
      toast.error('Please enter a task description (e.g. "follow up with designer")');
      return;
    }
    try {
      const result = await dispatch(enhanceTask(naturalInput)).unwrap();
      formik.setFieldValue('title', result.title || naturalInput);
      formik.setFieldValue('description', result.description || '');
      if (result.priority) {
        formik.setFieldValue('priority', result.priority);
      }
      toast.success('Generated task with Gemini AI!');
    } catch (error) {
      toast.error('Failed to enhance task');
    }
  };

  const handleInstantCreate = async () => {
    if (!naturalInput.trim()) {
      toast.error('Please enter a natural language task');
      return;
    }
    setIsInstantCreating(true);
    try {
      const aiResult = await dispatch(enhanceTask(naturalInput)).unwrap();
      const taskData = {
        title: aiResult.title || naturalInput,
        description: aiResult.description || '',
        priority: aiResult.priority || 'medium',
        status: 'pending',
      };
      await dispatch(createTask(taskData)).unwrap();
      toast.success(`Created: "${taskData.title}"`);
      dispatch(fetchDailySummary());
      dispatch(fetchWeeklySummary());
      handleClose();
    } catch (error) {
      toast.error(error || 'Failed to auto-create task');
    } finally {
      setIsInstantCreating(false);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    setNaturalInput('');
    dispatch(clearEnhancedTask());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-in border border-orange-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            <p className="text-xs text-gray-500 mt-0.5">Add task manually or auto-generate with Google Gemini AI</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Natural Language Input Section */}
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Natural Language AI Input
            </label>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-orange-200 text-orange-900 rounded-full">
              Google Gemini AI
            </span>
          </div>
          <p className="text-xs text-orange-900/70 mb-2.5">
            Type anything casually like <span className="font-semibold text-orange-950">&quot;follow up with designer&quot;</span> to generate a polished title and structured description.
          </p>

          <form onSubmit={handleEnhance} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                placeholder='e.g., "follow up with designer"'
                className="flex-1 px-4 py-2 bg-white border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={isEnhancing || !naturalInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                {isEnhancing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Suggest
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Example: &quot;follow up with designer&quot; → Title &amp; description
              </span>
              <button
                type="button"
                onClick={handleInstantCreate}
                disabled={isInstantCreating || isEnhancing || !naturalInput.trim()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-900 underline decoration-orange-300 underline-offset-2 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-orange-600" />
                {isInstantCreating ? 'Auto-creating...' : 'Quick Create with AI'}
              </button>
            </div>
          </form>
        </div>

        {/* Formik Form */}
        <form onSubmit={formik.handleSubmit} className="px-6 py-4.5 space-y-3.5" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-gray-700 mb-1">
              Title <span className="text-orange-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Follow up with UI Designer"
              className={`w-full px-4 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                formik.touched.title && formik.errors.title
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-transparent'
              }`}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {formik.errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Add structured details or let Gemini AI fill this in..."
              rows={2}
              className={`w-full px-4 py-2 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                formik.touched.description && formik.errors.description
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-transparent'
              }`}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-md shadow-orange-200 cursor-pointer"
            >
              {formik.isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
