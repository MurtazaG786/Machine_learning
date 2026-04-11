const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense, getTodayExpenses, getBalance, uploadReceipt } = require('../controllers/expenseController');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', auth, getExpenses);
router.get('/today', auth, getTodayExpenses);
router.get('/balance', auth, getBalance);
router.post('/upload-receipt', auth, upload.single('receipt'), uploadReceipt);
router.get('/:id', auth, getExpenseById);
router.post('/', auth, createExpense);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
