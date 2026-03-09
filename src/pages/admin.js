// Payday — Admin Dashboard
import { store, session } from '../utils/store.js';
import { formatCurrency, formatCurrencyShort, formatDate, statusLabel, statusBadgeClass, formatPhone, capitalize } from '../utils/formatters.js';
import { navigate } from '../router.js';

export function renderAdmin() {
    if (!session.isAdmin()) { navigate('/admin-login'); return document.createElement('div'); }

    const loans = store.getAll('loans');
    const users = store.getAll('users');
    const employers = store.getAll('employers');
    const repayments = store.getAll('repayments');
    const products = store.getAll('loan_products');

    // Stats
    const totalDisbursed = loans.reduce((s, l) => s + (l.principal || 0), 0);
    const totalOutstanding = loans.filter(l => ['active', 'overdue'].includes(l.status)).reduce((s, l) => s + (l.balance || 0), 0);
    const totalRepaid = repayments.reduce((s, r) => s + (r.amount || 0), 0);
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const overdueLoans = loans.filter(l => l.status === 'overdue').length;
    const paidLoans = loans.filter(l => l.status === 'paid').length;
    const repaymentRate = loans.length > 0 ? ((paidLoans / loans.length) * 100).toFixed(0) : 0;

    const el = document.createElement('div');
    el.innerHTML = `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <img src="./payday-logo.png" alt="Payday" class="brand-logo" />
          IBC Admin
        </div>
        <div class="sidebar-section-title">Dashboard</div>
        <ul class="sidebar-nav">
          <li><a href="#/admin" class="sidebar-link active">📊 Overview</a></li>
        </ul>
        <div class="sidebar-section-title">Management</div>
        <ul class="sidebar-nav">
          <li><a href="#/admin" class="sidebar-link" data-tab="loans">💰 Loan Book</a></li>
          <li><a href="#/admin" class="sidebar-link" data-tab="users">👥 Borrowers</a></li>
          <li><a href="#/admin" class="sidebar-link" data-tab="employers">🏢 Employers</a></li>
          <li><a href="#/admin" class="sidebar-link" data-tab="repayments">💳 Repayments</a></li>
          <li><a href="#/admin" class="sidebar-link" data-tab="products">📦 Products</a></li>
        </ul>
        <div class="sidebar-section-title">System</div>
        <ul class="sidebar-nav">
          <li><a href="#/admin" class="sidebar-link" data-tab="audit">📋 Audit Log</a></li>
          <li><a href="#" class="sidebar-link" id="admin-logout-link">🚪 Logout</a></li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="admin-content">
        <!-- Top bar -->
        <div class="flex justify-between items-center mb-xl">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800;">Admin Dashboard</h1>
            <p class="text-sm text-muted">${new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button id="admin-logout-btn" class="btn btn-sm btn-secondary">Logout</button>
        </div>

        <!-- Stat Cards -->
        <div id="admin-overview" class="admin-tab">
          <div class="grid grid-4 mb-xl" style="gap: 16px;">
            ${statCard('💰', 'Total Disbursed', formatCurrencyShort(totalDisbursed), 'var(--green-primary)', '+12%')}
            ${statCard('📊', 'Outstanding', formatCurrencyShort(totalOutstanding), 'var(--gold-primary)', '')}
            ${statCard('💳', 'Total Repaid', formatCurrencyShort(totalRepaid), 'var(--green-primary)', '')}
            ${statCard('📈', 'Repayment Rate', repaymentRate + '%', 'var(--status-info)', '')}
          </div>

          <div class="grid grid-3 mb-xl" style="gap: 16px;">
            <div class="card text-center" style="padding: 20px;">
              <div style="font-size: 2rem; font-weight: 900; color: var(--status-info);">${activeLoans}</div>
              <div class="text-sm text-muted">Active Loans</div>
            </div>
            <div class="card text-center" style="padding: 20px;">
              <div style="font-size: 2rem; font-weight: 900; color: var(--status-danger);">${overdueLoans}</div>
              <div class="text-sm text-muted">Overdue</div>
            </div>
            <div class="card text-center" style="padding: 20px;">
              <div style="font-size: 2rem; font-weight: 900; color: var(--green-primary);">${paidLoans}</div>
              <div class="text-sm text-muted">Paid</div>
            </div>
          </div>

          <!-- Recent Loans -->
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Recent Loans</h3>
            ${loanTable(loans.slice(-10).reverse(), users)}
          </div>
        </div>

        <!-- Loans Tab -->
        <div id="admin-loans" class="admin-tab hidden">
          <div class="card" style="padding: 24px;">
            <div class="flex justify-between items-center mb-md">
              <h3 class="font-semibold">Loan Book (${loans.length})</h3>
              <div class="flex gap-sm">
                <select id="loan-status-filter" class="form-input form-select" style="width: auto; padding: 8px 32px 8px 12px;">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Paid</option>
                  <option value="pending_acceptance">Pending</option>
                </select>
              </div>
            </div>
            ${loanTable(loans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), users)}
          </div>
        </div>

        <!-- Users Tab -->
        <div id="admin-users" class="admin-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Borrowers (${users.length})</h3>
            <div class="table-wrapper">
              <table class="table">
                <thead><tr><th>Name</th><th>Phone</th><th>ID</th><th>Status</th><th>Loans</th></tr></thead>
                <tbody>
                  ${users.map(u => {
        const uLoans = loans.filter(l => l.user_id === u.id).length;
        return `<tr>
                      <td class="font-medium">${u.full_name || '—'}</td>
                      <td>${formatPhone(u.phone)}</td>
                      <td class="text-muted">****${(u.id_no_enc || '').slice(-4)}</td>
                      <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
                      <td class="font-semibold">${uLoans}</td>
                    </tr>`;
    }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Employers Tab -->
        <div id="admin-employers" class="admin-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Employers (${employers.length})</h3>
            <div class="table-wrapper">
              <table class="table">
                <thead><tr><th>Name</th><th>Type</th><th>Risk Band</th><th>Status</th><th>Employees</th></tr></thead>
                <tbody>
                  ${employers.map(e => {
        const empCount = store.find('employment', emp => emp.employer_id === e.id).length;
        return `<tr>
                      <td class="font-medium">${e.name}</td>
                      <td class="text-muted">${capitalize(e.type)}</td>
                      <td><span class="badge badge-info">${e.risk_band}</span></td>
                      <td><span class="badge ${e.is_active ? 'badge-success' : 'badge-danger'}">${e.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td class="font-semibold">${empCount}</td>
                    </tr>`;
    }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Repayments Tab -->
        <div id="admin-repayments" class="admin-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Repayments (${repayments.length})</h3>
            <div class="table-wrapper">
              <table class="table">
                <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Loan</th></tr></thead>
                <tbody>
                  ${repayments.sort((a, b) => new Date(b.paid_at || b.created_at) - new Date(a.paid_at || a.created_at)).map(r => `
                    <tr>
                      <td class="text-sm">${formatDate(r.paid_at || r.created_at)}</td>
                      <td class="font-semibold text-green">${formatCurrency(r.amount)}</td>
                      <td><span class="badge badge-info">${r.method?.toUpperCase()}</span></td>
                      <td class="text-muted text-xs">${r.reference}</td>
                      <td class="text-xs text-muted">${r.loan_id?.slice(-8)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Products Tab -->
        <div id="admin-products" class="admin-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Loan Products (${products.length})</h3>
            <div class="table-wrapper">
              <table class="table">
                <thead><tr><th>Name</th><th>Tenor</th><th>Fee Rate</th><th>Min Amount</th><th>Max Amount</th><th>Status</th></tr></thead>
                <tbody>
                  ${products.map(p => `
                    <tr>
                      <td class="font-medium">${p.name}</td>
                      <td>${p.tenor_days} days</td>
                      <td class="font-semibold text-green">${(p.fee_rate * 100).toFixed(0)}%</td>
                      <td>${formatCurrency(p.min_amount)}</td>
                      <td>${formatCurrency(p.max_amount)}</td>
                      <td><span class="badge ${p.active ? 'badge-success' : 'badge-danger'}">${p.active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Audit Log -->
        <div id="admin-audit" class="admin-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Audit Log</h3>
            ${(() => {
            const logs = store.getAll('audit_logs').sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
            if (logs.length === 0) return '<p class="text-sm text-muted">No audit records yet.</p>';
            return `<div class="table-wrapper"><table class="table">
                <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
                <tbody>${logs.map(l => `
                  <tr>
                    <td class="text-xs">${formatDate(l.created_at)}</td>
                    <td class="text-sm">${l.actor_type}:${l.actor_id?.slice(-6)}</td>
                    <td><span class="badge badge-info">${l.action}</span></td>
                    <td class="text-xs text-muted">${l.entity}:${l.entity_id?.slice(-8)}</td>
                  </tr>
                `).join('')}</tbody>
              </table></div>`;
        })()}
          </div>
        </div>
      </main>
    </div>
  `;

    setTimeout(() => {
        // Tab navigation
        el.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const tab = link.dataset.tab;
                el.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                el.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
                const target = el.querySelector(`#admin-${tab}`);
                if (target) target.classList.remove('hidden');
                else el.querySelector('#admin-overview').classList.remove('hidden');
            });
        });

        // Overview link
        el.querySelector('.sidebar-link.active')?.addEventListener('click', e => {
            e.preventDefault();
            el.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
            el.querySelector('#admin-overview').classList.remove('hidden');
        });

        // Logout
        const doLogout = () => { session.clearAdminAuth(); navigate('/'); };
        el.querySelector('#admin-logout-btn')?.addEventListener('click', doLogout);
        el.querySelector('#admin-logout-link')?.addEventListener('click', e => { e.preventDefault(); doLogout(); });
    }, 0);

    return el;
}

function statCard(icon, label, value, color, change) {
    return `
    <div class="card stat-card">
      <div class="stat-icon" style="background: ${color}15; color: ${color};">${icon}</div>
      <div class="stat-value" style="color: ${color};">${value}</div>
      <div class="stat-label">${label}</div>
      ${change ? `<div class="stat-change positive">${change}</div>` : ''}
    </div>
  `;
}

function loanTable(loans, users) {
    if (loans.length === 0) return '<p class="text-sm text-muted">No loans found.</p>';
    return `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Date</th><th>Borrower</th><th>Principal</th><th>Balance</th><th>Status</th><th>Channel</th></tr></thead>
        <tbody>
          ${loans.map(l => {
        const u = users.find(usr => usr.id === l.user_id);
        return `<tr>
              <td class="text-sm">${formatDate(l.created_at)}</td>
              <td class="font-medium">${u?.full_name || '—'}</td>
              <td class="font-semibold">${formatCurrency(l.principal)}</td>
              <td>${formatCurrency(l.balance)}</td>
              <td><span class="badge ${statusBadgeClass(l.status)}">${statusLabel(l.status)}</span></td>
              <td class="text-xs text-muted">${l.created_channel?.toUpperCase() || '—'}</td>
            </tr>`;
    }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
