const Expense = require('../models/Expense');
const path = require('path');
const fs = require('fs');

const VALID_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Travel', 'Other'];

exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    // Only allow known category values to prevent query operator injection
    if (category && VALID_CATEGORIES.includes(category)) query.category = category;
    const expenses = await Expense.find(query).sort({ date: -1 }).limit(50);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { amount, category, description, date, paymentMethod, isGroupExpense, group } = req.body;
    const expense = await Expense.create({ user: req.user._id, amount, category, description, date, paymentMethod, isGroupExpense, group });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { amount, category, description, date, paymentMethod } = req.body;
    const update = {};
    if (amount !== undefined) update.amount = amount;
    if (category && VALID_CATEGORIES.includes(category)) update.category = category;
    if (description) update.description = description;
    if (date) update.date = date;
    if (paymentMethod) update.paymentMethod = paymentMethod;
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayExpenses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expenses = await Expense.find({ user: req.user._id, date: { $gte: today, $lt: tomorrow } }).sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ expenses, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const expenses = await Expense.find({ user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyBudget = req.user.monthlyBudget || 0;
    res.json({ monthlyBudget, totalExpenses, balance: monthlyBudget - totalExpenses, expenseCount: expenses.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadReceipt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const Tesseract = require('tesseract.js');
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng', { logger: () => {} });

    let amount = null;
    const amountMatch = text.match(/(?:total|amount|grand total|rs\.?|₹|\$|€|£)\s*:?\s*(\d+\.?\d{0,2})/i) || text.match(/(\d+\.\d{2})/);
    if (amountMatch) amount = parseFloat(amountMatch[1]);

    const categoryKeywords = {
      Food: ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'meal', 'dining', 'eat', 'coffee', 'bakery', 'kitchen'],
      Transport: ['uber', 'taxi', 'fuel', 'petrol', 'diesel', 'parking', 'metro', 'bus', 'train', 'flight', 'toll'],
      Shopping: ['mall', 'shop', 'store', 'purchase', 'retail', 'amazon', 'flipkart', 'mart', 'supermarket'],
      Entertainment: ['movie', 'cinema', 'netflix', 'game', 'concert', 'theatre', 'event', 'ticket'],
      Health: ['pharmacy', 'medicine', 'hospital', 'clinic', 'doctor', 'medical', 'health', 'drug'],
      Bills: ['electricity', 'water', 'gas', 'internet', 'phone', 'bill', 'utility', 'recharge'],
      Education: ['school', 'college', 'university', 'course', 'book', 'education', 'tuition', 'library'],
      Travel: ['hotel', 'resort', 'airbnb', 'travel', 'tour', 'vacation', 'holiday']
    };

    let category = 'Other';
    const lowerText = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) { category = cat; break; }
    }

    res.json({ success: true, text, amount, category, imagePath: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
