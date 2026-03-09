// Payday — Loan Details
import { store, session } from '../utils/store.js';
import { formatCurrency, formatDate, daysUntil, statusLabel, statusBadgeClass } from '../utils/formatters.js';
import { navigate } from '../router.js';

export function renderLoanDetails() {
  const user = session.getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const loan = store.findOne('loans', l => l.user_id === user.id && ['active', 'overdue', 'pending_acceptance'].includes(l.status));
  if (!loan) { navigate('/dashboard'); return document.createElement('div'); }

  const product = store.getById('loan_products', loan.product_id);
  const employer = store.getById('employers', loan.employer_id);
  const repayments = store.find('repayments', r => r.loan_id === loan.id).sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at));
  const paidPct = Math.min(100, ((loan.amount_paid / loan.total_due) * 100));
  const daysLeft = daysUntil(loan.due_date);

  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = `
    <nav class="navbar">
      <div class="container flex items-center justify-between">
        <a href="#/dashboard" class="navbar-brand"><img src="/payday-logo.png" alt="Payday" class="brand-logo" /></a>
        <a href="#/dashboard" class="btn btn-sm btn-secondary">← Back</a>
      </div>
    </nav>
    <div class="container page-padded" style="max-width: 640px;">
      <div class="flex justify-between items-center mb-lg animate-slide-up">
        <div>
          <h1 style="font-size: 1.4rem; font-weight: 800;">Loan Details</h1>
          <p class="text-sm text-muted">${product?.name || 'Loan'} · ${employer?.name || ''}</p>
        </div>
        <span class="badge ${statusBadgeClass(loan.status)}" style="font-size: 0.85rem;">${statusLabel(loan.status)}</span>
      </div>

      <!-- Circular Progress -->
      <div class="card card-glow text-center mb-lg animate-scale-in" style="padding: 32px;">
        <div class="circular-progress" style="width: 140px; height: 140px; margin: 0 auto 20px;">
          <svg width="140" height="140"><circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg-input)" stroke-width="10"/><circle cx="70" cy="70" r="60" fill="none" stroke="var(--green-primary)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 60}" stroke-dashoffset="${2 * Math.PI * 60 * (1 - paidPct / 100)}" style="transition: stroke-dashoffset 1s ease;"/></svg>
          <span class="progress-text text-green">${paidPct.toFixed(0)}%</span>
        </div>
        <div class="text-sm text-muted">Repaid</div>
        <div style="font-size: 1.6rem; font-weight: 800;">${formatCurrency(loan.amount_paid)} <span class="text-sm text-muted font-normal">of ${formatCurrency(loan.total_due)}</span></div>
      </div>

      <!-- Details Grid -->
      <div class="card mb-lg animate-fade-in" style="padding: 24px;">
        <h3 class="font-semibold mb-md">Loan Summary</h3>
        <div style="display: grid; gap: 14px;">
          ${detailRow('Principal', formatCurrency(loan.principal))}
          ${detailRow('Fee', formatCurrency(loan.fee))}
          ${detailRow('Total Repayable', formatCurrency(loan.total_due), true)}
          ${detailRow('Amount Paid', formatCurrency(loan.amount_paid))}
          ${detailRow('Balance', formatCurrency(loan.balance), true)}
          ${detailRow('Due Date', formatDate(loan.due_date) + (daysLeft < 0 ? ` (${Math.abs(daysLeft)}d overdue)` : ` (${daysLeft}d left)`))}
          ${detailRow('Channel', loan.created_channel?.toUpperCase())}
          ${detailRow('Repayment Method', 'Checkoff → STK Fallback')}
        </div>
      </div>

      <!-- Repayment History -->
      <div class="card animate-fade-in" style="padding: 24px;">
        <div class="flex justify-between items-center mb-md">
          <h3 class="font-semibold">Repayment History</h3>
          <span class="text-sm text-muted">${repayments.length} record(s)</span>
        </div>
        ${repayments.length > 0 ? `
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Ref</th></tr></thead>
            <tbody>
              ${repayments.map(r => `
                <tr>
                  <td>${formatDate(r.paid_at)}</td>
                  <td class="font-semibold text-green">${formatCurrency(r.amount)}</td>
                  <td><span class="badge badge-info">${r.method?.toUpperCase()}</span></td>
                  <td class="text-muted text-xs">${r.reference}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : '<p class="text-sm text-muted">No payments made yet.</p>'}

        ${loan.balance > 0 ? `<a href="#/repay" class="btn btn-primary btn-full mt-lg">Make a Payment →</a>` : ''}
      </div>
    </div>
    <div class="bottom-nav"><div class="bottom-nav-items">
      <a href="#/dashboard" class="bottom-nav-item"><span class="nav-icon">🏠</span>Home</a>
      <a href="#/apply" class="bottom-nav-item"><span class="nav-icon">📝</span>Apply</a>
      <a href="#/repay" class="bottom-nav-item"><span class="nav-icon">💳</span>Repay</a>
      <a href="#/profile" class="bottom-nav-item"><span class="nav-icon">👤</span>Profile</a>
    </div></div>
  `;
  return el;
}

function detailRow(label, value, bold = false) {
  return `<div class="flex justify-between"><span class="text-sm text-muted">${label}</span><span class="${bold ? 'font-bold' : 'font-semibold'}">${value}</span></div>`;
}
