const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const group = await Group.create({
      name, description, createdBy: req.user._id,
      members: [{ user: req.user._id, name: req.user.name, email: req.user.email }, ...(members || [])]
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const { name, email } = req.body;
    group.members.push({ name, email });
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addGroupExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const { description, amount, category, splits } = req.body;
    const expense = {
      description, amount, category,
      paidBy: req.user._id, paidByName: req.user.name,
      splits: splits || (group.members.length > 0 ? group.members.map(m => ({ user: m.user, name: m.name, amount: amount / group.members.length, settled: false })) : [])
    };
    group.expenses.push(expense);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.settleExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const { expenseId, memberId } = req.body;
    const expense = group.expenses.id(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    const split = expense.splits.find(s => s.user?.toString() === memberId);
    if (split) { split.settled = true; await group.save(); }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
