const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  enhanceTaskSchema,
} = require('../validators/task.validator');

// All routes require authentication
router.use(authenticate);

// AI enhancement (placed before /:id to avoid route conflict)
router.post('/enhance', validate(enhanceTaskSchema), taskController.enhanceTask);

// CRUD routes
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', validate(taskIdSchema, 'params'), taskController.getTask);
router.put('/:id', validate(taskIdSchema, 'params'), validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', validate(taskIdSchema, 'params'), taskController.deleteTask);

module.exports = router;
