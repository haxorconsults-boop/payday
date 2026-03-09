// Payday — Customer Dashboard
import { store, session } from '../utils/store.js';
import { formatCurrency, formatDate, daysUntil, statusLabel, statusBadgeClass } from '../utils/formatters.js';
import { checkEligibility } from '../utils/eligibility.js';
import { navigate } from '../router.js';

export function renderDashboard() {
  const user = session.getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  // Refresh user data
  const freshUser = store.getById('users', user.id) || user;
  const employment = store.findOne('employment', e => e.user_id === user.id);
  const employer = employment ? store.getById('employers', employment.employer_id) : null;
  const eligibility = checkEligibility(user.id);
  const activeLoan = store.findOne('loans', l => l.user_id === user.id && ['active', 'overdue', 'pending_acceptance'].includes(l.status));
  const allLoans = store.find('loans', l => l.user_id === user.id);
  const recentRepayments = store.find('repayments', r => allLoans.some(l => l.id === r.loan_id)).slice(-5).reverse();

  const el = document.createElement('div');
  el.className = 'page';

  el.innerHTML = `
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container flex items-center justify-between">
        <a href="#/dashboard" class="navbar-brand">
          <img src="/payday-logo.png" alt="Payday" class="brand-logo" />
        </a>
        <ul class="navbar-nav">
          <li><a href="#/dashboard" class="active">Dashboard</a></li>
          <li><a href="#/apply">Apply</a></li>
          <li><a href="#/ussd">USSD</a></li>
        </ul>
        <div class="navbar-actions">
          <a href="#/profile" class="btn btn-icon btn-secondary" title="Profile">👤</a>
          <button id="logout-btn" class="btn btn-sm btn-secondary">Logout</button>
        </div>
        <button class="menu-toggle" id="dash-menu-toggle">☰</button>
      </div>
    </nav>

    <div class="container page-padded" style="max-width: 960px;">
      <!-- Welcome -->
      <div class="mb-xl animate-slide-up">
        <h1 style="font-size: 1.6rem; font-weight: 800;">
          Habari, <span class="text-green">${freshUser.full_name || 'User'}</span> 👋
        </h1>
        <p class="text-sm text-muted">${employer ? employer.name + ' • ' + (employment?.staff_no || '') : 'Complete your profile'}</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-4 mb-xl" style="gap: 16px;">
        <div class="card stat-card animate-fade-in">
          <div class="stat-icon" style="background: var(--green-glow); color: var(--green-primary);">💰</div>
          <div class="stat-value text-green">${formatCurrency(eligibility.limit || 0)}</div>
          <div class="stat-label">Available Limit</div>
        </div>
        <div class="card stat-card animate-fade-in">
          <div class="stat-icon" style="background: rgba(255,193,7,0.1); color: var(--gold-primary);">📊</div>
          <div class="stat-value">${activeLoan ? formatCurrency(activeLoan.balance) : '—'}</div>
          <div class="stat-label">Active Balance</div>
        </div>
        <div class="card stat-card animate-fade-in">
          <div class="stat-icon" style="background: rgba(68,138,255,0.1); color: var(--status-info);">📅</div>
          <div class="stat-value">${activeLoan ? (daysUntil(activeLoan.due_date) > 0 ? daysUntil(activeLoan.due_date) + 'd' : 'Due!') : '—'}</div>
          <div class="stat-label">Days to Due</div>
        </div>
        <div class="card stat-card animate-fade-in">
          <div class="stat-icon" style="background: rgba(0,200,83,0.1); color: var(--green-primary);">⭐</div>
          <div class="stat-value">${eligibility.score !== undefined ? (10 - eligibility.score) + '/10' : '—'}</div>
          <div class="stat-label">Credit Score</div>
        </div>
      </div>

      <!-- Active Loan Card -->
      ${activeLoan ? `
      <div class="card card-glow mb-xl animate-scale-in">
        <div class="flex justify-between items-center mb-md">
          <h3 class="font-semibold">Active Loan</h3>
          <span class="badge ${statusBadgeClass(activeLoan.status)}">${statusLabel(activeLoan.status)}</span>
        </div>
        <div class="grid grid-3 mb-md" style="gap: 16px;">
          <div>
            <div class="text-xs text-muted">Principal</div>
            <div class="font-bold">${formatCurrency(activeLoan.principal)}</div>
          </div>
          <div>
            <div class="text-xs text-muted">Total Due</div>
            <div class="font-bold">${formatCurrency(activeLoan.total_due)}</div>
          </div>
          <div>
            <div class="text-xs text-muted">Due Date</div>
            <div class="font-bold ${daysUntil(activeLoan.due_date) < 0 ? 'text-danger' : ''}">${formatDate(activeLoan.due_date)}</div>
          </div>
        </div>
        <div class="mb-md">
          <div class="flex justify-between text-sm mb-xs">
            <span class="text-muted">Repaid</span>
            <span class="font-semibold">${formatCurrency(activeLoan.amount_paid)} / ${formatCurrency(activeLoan.total_due)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${Math.min(100, ((activeLoan.amount_paid / activeLoan.total_due) * 100)).toFixed(0)}%;"></div>
          </div>
        </div>
        <div class="flex gap-sm">
          <a href="#/loan-details" class="btn btn-secondary btn-sm flex-1">View Details</a>
          <a href="#/repay" class="btn btn-primary btn-sm flex-1">Pay Now →</a>
        </div>
      </div>
      ` : `
      <div class="card text-center mb-xl animate-fade-in" style="padding: 40px;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🎯</div>
        <h3 class="mb-sm">No Active Loan</h3>
        <p class="text-sm text-muted mb-lg">You're eligible for up to ${formatCurrency(eligibility.limit || 0)}</p>
        <a href="#/apply" class="btn btn-primary">Apply for a Loan →</a>
      </div>
      `}

      <!-- Quick Actions -->
      <div class="grid grid-3 mb-xl" style="gap: 12px;">
        <a href="#/apply" class="card text-center" style="padding: 20px; text-decoration: none; color: inherit;">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
          <div class="text-sm font-semibold">Apply Loan</div>
        </a>
        <a href="#/repay" class="card text-center" style="padding: 20px; text-decoration: none; color: inherit;">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">💳</div>
          <div class="text-sm font-semibold">Make Payment</div>
        </a>
        <a href="#/ussd" class="card text-center" style="padding: 20px; text-decoration: none; color: inherit;">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">📱</div>
          <div class="text-sm font-semibold">USSD Demo</div>
        </a>
      </div>

      <!-- Recent Transactions -->
      <div class="card animate-fade-in">
        <h3 class="font-semibold mb-md">Recent Transactions</h3>
        ${recentRepayments.length > 0 ? `
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr>
            </thead>
            <tbody>
              ${recentRepayments.map(r => `
                <tr>
                  <td>${formatDate(r.paid_at)}</td>
                  <td class="font-semibold text-green">${formatCurrency(r.amount)}</td>
                  <td><span class="badge badge-info">${r.method?.toUpperCase()}</span></td>
                  <td class="text-muted text-sm">${r.reference}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : '<p class="text-sm text-muted">No transactions yet.</p>'}
      </div>
    </div>

    <!-- Bottom Nav (Mobile) -->
    <div class="bottom-nav">
      <div class="bottom-nav-items">
        <a href="#/dashboard" class="bottom-nav-item active"><span class="nav-icon">🏠</span>Home</a>
        <a href="#/apply" class="bottom-nav-item"><span class="nav-icon">📝</span>Apply</a>
        <a href="#/repay" class="bottom-nav-item"><span class="nav-icon">💳</span>Repay</a>
        <a href="#/profile" class="bottom-nav-item"><span class="nav-icon">👤</span>Profile</a>
      </div>
    </div>
  `;

  setTimeout(() => {
    el.querySelector('#logout-btn')?.addEventListener('click', () => { session.logout(); navigate('/'); });
  }, 0);

  return el;
}
