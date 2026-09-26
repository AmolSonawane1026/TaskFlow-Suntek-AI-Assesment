const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Task title is required',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Task title is required',
    }),

  description: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 2000 characters',
    }),

  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be pending, in-progress, or completed',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be low, medium, or high',
    }),

  category: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .optional(),

  dueDate: Joi.date()
    .iso()
    .allow(null, '')
    .optional()
    .messages({
      'date.format': 'Due date must be a valid date format',
    }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
    }),

  description: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 2000 characters',
    }),

  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be pending, in-progress, or completed',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be low, medium, or high',
    }),

  category: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .optional(),

  dueDate: Joi.date()
    .iso()
    .allow(null, '')
    .optional(),
});

const taskIdSchema = Joi.object({
  id: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'string.empty': 'Task ID is required',
      'string.pattern.base': 'Invalid task ID format',
      'any.required': 'Task ID is required',
    }),
});

const enhanceTaskSchema = Joi.object({
  input: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Task input is required',
      'string.max': 'Input cannot exceed 500 characters',
      'any.required': 'Task input is required',
    }),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  enhanceTaskSchema,
};
