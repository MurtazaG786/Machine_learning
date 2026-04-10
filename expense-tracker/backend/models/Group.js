const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  }],
  expenses: [{
    description: String,
    amount: Number,
    category: String,
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidByName: String,
    date: { type: Date, default: Date.now },
    splits: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      amount: Number,
      settled: { type: Boolean, default: false }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
