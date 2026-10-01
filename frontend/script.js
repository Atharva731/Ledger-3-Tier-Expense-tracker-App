const API_BASE = '/api/expenses';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const statusEl = document.getElementById('status');
const todayLabel = document.getElementById('todayLabel');

todayLabel.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
document.getElementById('date').value = new Date().toISOString().slice(0, 10);

function setStatus(msg) {
  statusEl.textContent = msg || '';
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function fetchSummary() {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error('Failed to load summary');
  const data = await res.json();

  document.getElementById('monthTotal').textContent = fmt(data.total);
  document.getElementById('entryCount').textContent = data.count;
  document.getElementById('topCat').textContent = data.byCategory.length ? data.byCategory[0].category : '—';

  const bwrap = document.getElementById('breakdownWrap');
  const bdiv = document.getElementById('breakdown');
  if (data.byCategory.length) {
    bwrap.style.display = 'block';
    const max = data.byCategory[0].total;
    bdiv.innerHTML = data.byCategory.map(({ category, total }) => `
      <div class="bar-row">
        <div class="cat">${category}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(total / max * 100).toFixed(0)}%"></div></div>
        <div class="bar-amt">${fmt(total)}</div>
      </div>`).join('');
  } else {
    bwrap.style.display = 'none';
  }
}

async function fetchExpenses() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to load expenses');
  const expenses = await res.json();

  const ledger = document.getElementById('ledger');
  if (!expenses.length) {
    ledger.innerHTML = '<div class="empty">No expenses yet. Add your first one above.</div>';
    return;
  }
  ledger.innerHTML = expenses.slice(0, 100).map(e => `
    <div class="entry">
      <div class="date">${new Date(e.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
      <div class="desc">${e.note ? escapeHtml(e.note) : '<span style="color:var(--ink-soft)">No note</span>'}<span class="cat-tag">${e.category}</span></div>
      <div class="amt">${fmt(e.amount)}</div>
      <button class="del" data-id="${e.id}" aria-label="Delete entry">✕</button>
    </div>`).join('');
}

async function refresh() {
  try {
    await Promise.all([fetchSummary(), fetchExpenses()]);
  } catch (err) {
    setStatus('Could not reach the server. Is the backend running?');
  }
}

document.getElementById('expenseForm').addEventListener('submit', async function (ev) {
  ev.preventDefault();
  setStatus('');
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const expense_date = document.getElementById('date').value;
  const note = document.getElementById('note').value.trim();

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, expense_date, note })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data.errors && data.errors.join(', ')) || 'Failed to add expense');
    }
    this.reset();
    document.getElementById('date').value = new Date().toISOString().slice(0, 10);
    await refresh();
  } catch (err) {
    setStatus(err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById('ledger').addEventListener('click', async function (ev) {
  const btn = ev.target.closest('.del');
  if (!btn) return;
  try {
    const res = await fetch(`${API_BASE}/${btn.dataset.id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Failed to delete expense');
    await refresh();
  } catch (err) {
    setStatus(err.message);
  }
});

refresh();
