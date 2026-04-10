const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMonthlyStats, getCategoryBreakdown, getWeeklyTrend, getTopCategories } = require('../controllers/analyticsController');

router.get('/monthly', auth, getMonthlyStats);
router.get('/categories', auth, getCategoryBreakdown);
router.get('/weekly', auth, getWeeklyTrend);
router.get('/top-categories', auth, getTopCategories);

module.exports = router;
