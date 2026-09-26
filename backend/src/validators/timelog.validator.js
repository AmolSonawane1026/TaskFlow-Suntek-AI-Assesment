const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const startTimerSchema = Joi.object({
  taskId: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'string.empty': 'Task ID is required',
      'string.pattern.base': 'Invalid task ID format',
      'any.required': 'Task ID is required',
    }),
});

const stopTimerSchema = Joi.object({
  timeLogId: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'string.empty': 'Time log ID is required',
      'string.pattern.base': 'Invalid time log ID format',
      'any.required': 'Time log ID is required',
    }),
});

const taskTimeLogsSchema = Joi.object({
  taskId: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'string.empty': 'Task ID is required',
      'string.pattern.base': 'Invalid task ID format',
      'any.required': 'Task ID is required',
    }),
});

module.exports = {
  startTimerSchema,
  stopTimerSchema,
  taskTimeLogsSchema,
};
