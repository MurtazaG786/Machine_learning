const Expense = require('../models/Expense');

exports.getMonthlyStats = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const stats = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } }
    ]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = months.map((name, i) => {
      const found = stats.find(s => s._id.month === i + 1);
      return { month: name, total: found ? found.total : 0, count: found ? found.count : 0 };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const stats = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    res.json(stats.map(s => ({ category: s._id, total: s.total, count: s.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWeeklyTrend = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const exps = await Expense.find({ user: req.user._id, date: { $gte: d, $lt: next } });
      const total = exps.reduce((sum, e) => sum + e.amount, 0);
      days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), total, date: d.toISOString().split('T')[0] });
    }
    res.json(days);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopCategories = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const stats = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    res.json(stats.map(s => ({ category: s._id, total: s.total, count: s.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
