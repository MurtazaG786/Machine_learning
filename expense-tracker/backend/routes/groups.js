const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGroup, getGroups, getGroupById, addMember, addGroupExpense, settleExpense, deleteGroup } = require('../controllers/groupController');

router.get('/', auth, getGroups);
router.post('/', auth, createGroup);
router.get('/:id', auth, getGroupById);
router.post('/:id/members', auth, addMember);
router.post('/:id/expenses', auth, addGroupExpense);
router.post('/:id/settle', auth, settleExpense);
router.delete('/:id', auth, deleteGroup);

module.exports = router;
