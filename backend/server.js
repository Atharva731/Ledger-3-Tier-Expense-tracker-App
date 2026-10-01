const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/expenses', expensesRouter);

// Serve the frontend as static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
  console.log(`Expense tracker server running at http://localhost:${PORT}`);
});
