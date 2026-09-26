const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summary.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/daily', summaryController.getDailySummary);
router.get('/weekly', summaryController.getWeeklySummary);
router.get('/ai', summaryController.getAiSummary);

module.exports = router;
