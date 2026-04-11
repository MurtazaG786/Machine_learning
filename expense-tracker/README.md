# 💰 Expense Tracker - MERN Stack

A full-featured daily expense tracker with OCR bill scanning, group expenses, and analytics.

## Features
- 📊 Dashboard with balance, today's spending, and recent transactions
- 📷 Bill scanning with OCR (Tesseract.js) to auto-extract amount and category
- ➕ Add expenses with category, payment method, and receipt upload
- 👥 Group expenses with debt simplification ("who owes whom")
- 📈 Analytics with monthly, weekly, and category charts

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Recharts, React Router v6
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Auth
- **OCR**: Tesseract.js

## Setup & Run

### Prerequisites
- Node.js >= 16
- MongoDB (local or MongoDB Atlas)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
