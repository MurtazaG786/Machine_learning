const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { message: 'Too many requests, please try again later.' } });
app.use('/api/', apiLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => res.json({ message: 'Expense Tracker API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
