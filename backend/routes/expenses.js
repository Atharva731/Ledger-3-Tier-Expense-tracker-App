const express = require('express');
const router = express.Router();
const pool = require('../db');

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Other'];

function validateExpense(body) {
  const errors = [];
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.push('amount must be a positive number');
  if (!CATEGORIES.includes(body.category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (!body.expense_date || isNaN(Date.parse(body.expense_date))) errors.push('expense_date must be a valid date');
  return errors;
}

// GET /api/expenses - list all expenses, most recent first
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, amount, category, expense_date, note, created_at FROM expenses ORDER BY expense_date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/expenses/summary - current month total + breakdown by category
router.get('/summary', async (req, res) => {
  try {
    const [totalRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM expenses
       WHERE YEAR(expense_date) = YEAR(CURDATE()) AND MONTH(expense_date) = MONTH(CURDATE())`
    );
    const [byCategory] = await pool.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       WHERE YEAR(expense_date) = YEAR(CURDATE()) AND MONTH(expense_date) = MONTH(CURDATE())
       GROUP BY category
       ORDER BY total DESC`
    );
    res.json({
      total: Number(totalRows[0].total),
      count: totalRows[0].count,
      byCategory: byCategory.map(r => ({ category: r.category, total: Number(r.total) }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST /api/expenses - create a new expense
router.post('/', async (req, res) => {
  const errors = validateExpense(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { amount, category, expense_date, note = '' } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO expenses (amount, category, expense_date, note) VALUES (?, ?, ?, ?)',
      [amount, category, expense_date, note]
    );
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// DELETE /api/expenses/:id - remove an expense
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Expense not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
