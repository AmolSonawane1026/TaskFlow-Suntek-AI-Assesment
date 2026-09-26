const express = require('express');
const router = express.Router();
const timeLogController = require('../controllers/timelog.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  startTimerSchema,
  stopTimerSchema,
  taskTimeLogsSchema,
} = require('../validators/timelog.validator');

// All routes require authentication
router.use(authenticate);

router.post('/start', validate(startTimerSchema), timeLogController.startTimer);
router.post('/stop', validate(stopTimerSchema), timeLogController.stopTimer);
router.get('/active', timeLogController.getActiveTimer);
router.get('/', timeLogController.getTimeLogs);
router.get('/task/:taskId', validate(taskTimeLogsSchema, 'params'), timeLogController.getTaskTimeLogs);

module.exports = router;
