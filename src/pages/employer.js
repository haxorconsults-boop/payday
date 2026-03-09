// Payday — Employer Portal (Checkoff Management)
import { store, session, auditLog } from '../utils/store.js';
import { formatCurrency, formatDate, formatPhone, statusLabel, statusBadgeClass } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderEmployer() {
    const empAuth = session.getEmployerAuth();
    if (!empAuth) { navigate('/employer-login'); return document.createElement('div'); }

    const employer = store.getById('employers', empAuth.id);
    const employments = store.find('employment', e => e.employer_id === empAuth.id);
    const userIds = employments.map(e => e.user_id);
    const employees = userIds.map(uid => store.getById('users', uid)).filter(Boolean);
    const loans = store.find('loans', l => l.employer_id === empAuth.id);
    const activeLoans = loans.filter(l => ['active', 'overdue'].includes(l.status));
    const totalDeductions = activeLoans.reduce((s, l) => s + (l.balance || 0), 0);

    const el = document.createElement('div');
    el.innerHTML = `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <img src="/payday-logo.png" alt="Payday" class="brand-logo" />
          Employer Portal
        </div>
        <div class="sidebar-section-title">${employer?.name || 'Employer'}</div>
        <ul class="sidebar-nav">
          <li><a href="#" class="sidebar-link active" data-tab="overview">📊 Overview</a></li>
          <li><a href="#" class="sidebar-link" data-tab="employees">👥 Employees</a></li>
          <li><a href="#" class="sidebar-link" data-tab="deductions">💰 Deductions</a></li>
          <li><a href="#" class="sidebar-link" data-tab="remit">📤 Remittance</a></li>
        </ul>
        <div class="sidebar-section-title">Account</div>
        <ul class="sidebar-nav">
          <li><a href="#" class="sidebar-link" id="emp-logout-link">🚪 Logout</a></li>
        </ul>
      </aside>

      <main class="admin-content">
        <div class="flex justify-between items-center mb-xl">
          <div>
            <h1 style="font-size: 1.4rem; font-weight: 800;">${employer?.name || 'Employer'} Portal</h1>
            <p class="text-sm text-muted">Risk Band: <span class="badge badge-info">${employer?.risk_band || '—'}</span></p>
          </div>
          <button id="emp-logout-btn" class="btn btn-sm btn-secondary">Logout</button>
        </div>

        <!-- Overview Tab -->
        <div id="emp-overview" class="emp-tab">
          <div class="grid grid-4 mb-xl" style="gap: 16px;">
            <div class="card stat-card"><div class="stat-icon" style="background: var(--green-glow); color: var(--green-primary);">👥</div><div class="stat-value">${employees.length}</div><div class="stat-label">Employees</div></div>
            <div class="card stat-card"><div class="stat-icon" style="background: rgba(68,138,255,0.1); color: var(--status-info);">💰</div><div class="stat-value">${activeLoans.length}</div><div class="stat-label">Active Loans</div></div>
            <div class="card stat-card"><div class="stat-icon" style="background: rgba(255,193,7,0.1); color: var(--gold-primary);">📊</div><div class="stat-value text-gold">${formatCurrency(totalDeductions)}</div><div class="stat-label">Pending Deductions</div></div>
            <div class="card stat-card"><div class="stat-icon" style="background: rgba(0,200,83,0.1); color: var(--green-primary);">✅</div><div class="stat-value">${loans.filter(l => l.status === 'paid').length}</div><div class="stat-label">Cleared Loans</div></div>
          </div>

          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Active Deduction Schedule</h3>
            ${activeLoans.length > 0 ? `
            <div class="table-wrapper"><table class="table">
              <thead><tr><th>Employee</th><th>Staff No</th><th>Loan Amount</th><th>Balance</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                ${activeLoans.map(l => {
        const u = store.getById('users', l.user_id);
        const emp = store.findOne('employment', e => e.user_id === l.user_id && e.employer_id === empAuth.id);
        return `<tr>
                    <td class="font-medium">${u?.full_name || '—'}</td>
                    <td class="text-sm text-muted">${emp?.staff_no || '—'}</td>
                    <td>${formatCurrency(l.principal)}</td>
                    <td class="font-semibold text-gold">${formatCurrency(l.balance)}</td>
                    <td>${formatDate(l.due_date)}</td>
                    <td><span class="badge ${statusBadgeClass(l.status)}">${statusLabel(l.status)}</span></td>
                  </tr>`;
    }).join('')}
              </tbody>
            </table></div>
            ` : '<p class="text-sm text-muted">No active deductions.</p>'}
          </div>
        </div>

        <!-- Employees Tab -->
        <div id="emp-employees" class="emp-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Registered Employees (${employees.length})</h3>
            <div class="table-wrapper"><table class="table">
              <thead><tr><th>Name</th><th>Phone</th><th>Staff No</th><th>Net Salary</th><th>Verified</th></tr></thead>
              <tbody>
                ${employees.map(u => {
        const emp = employments.find(e => e.user_id === u.id);
        return `<tr>
                    <td class="font-medium">${u.full_name || '—'}</td>
                    <td>${formatPhone(u.phone)}</td>
                    <td>${emp?.staff_no || '—'}</td>
                    <td>${formatCurrency(emp?.net_salary || 0)}</td>
                    <td>${emp?.verified ? '<span class="text-green">✅</span>' : '⏳'}</td>
                  </tr>`;
    }).join('')}
              </tbody>
            </table></div>
          </div>
        </div>

        <!-- Deductions Tab -->
        <div id="emp-deductions" class="emp-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">All Deductions</h3>
            ${loans.length > 0 ? `
            <div class="table-wrapper"><table class="table">
              <thead><tr><th>Employee</th><th>Principal</th><th>Fee</th><th>Total Due</th><th>Paid</th><th>Status</th></tr></thead>
              <tbody>
                ${loans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(l => {
        const u = store.getById('users', l.user_id);
        return `<tr>
                    <td class="font-medium">${u?.full_name || '—'}</td>
                    <td>${formatCurrency(l.principal)}</td>
                    <td class="text-muted">${formatCurrency(l.fee)}</td>
                    <td class="font-semibold">${formatCurrency(l.total_due)}</td>
                    <td class="text-green">${formatCurrency(l.amount_paid)}</td>
                    <td><span class="badge ${statusBadgeClass(l.status)}">${statusLabel(l.status)}</span></td>
                  </tr>`;
    }).join('')}
              </tbody>
            </table></div>
            ` : '<p class="text-sm text-muted">No deduction records.</p>'}
          </div>
        </div>

        <!-- Remittance Tab -->
        <div id="emp-remit" class="emp-tab hidden">
          <div class="card" style="padding: 24px;">
            <h3 class="font-semibold mb-md">Remit Checkoff Payment</h3>
            <p class="text-sm text-muted mb-lg">Process payroll deduction for all active loans. This simulates the employer remitting checkoff to Payday.</p>

            <div class="card mb-lg" style="background: var(--bg-input); padding: 20px; border-radius: 12px;">
              <div class="text-center">
                <div class="text-sm text-muted">Total to Remit</div>
                <div style="font-size: 2rem; font-weight: 900; color: var(--gold-primary);">${formatCurrency(totalDeductions)}</div>
                <div class="text-xs text-muted">${activeLoans.length} employee deduction(s)</div>
              </div>
            </div>

            ${activeLoans.length > 0 ? `
            <button id="remit-btn" class="btn btn-gold btn-full btn-lg">Process Checkoff Remittance →</button>
            ` : '<p class="text-sm text-muted">No active deductions to remit.</p>'}
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
                el.querySelectorAll('.emp-tab').forEach(t => t.classList.add('hidden'));
                el.querySelector(`#emp-${tab}`)?.classList.remove('hidden');
            });
        });

        // Logout
        const doLogout = () => { session.clearEmployerAuth(); navigate('/'); };
        el.querySelector('#emp-logout-btn')?.addEventListener('click', doLogout);
        el.querySelector('#emp-logout-link')?.addEventListener('click', e => { e.preventDefault(); doLogout(); });

        // Remittance
        el.querySelector('#remit-btn')?.addEventListener('click', () => {
            activeLoans.forEach(loan => {
                store.create('repayments', {
                    loan_id: loan.id,
                    amount: loan.balance,
                    method: 'checkoff',
                    reference: 'CHK-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-' + loan.id.slice(-4),
                    paid_at: new Date().toISOString()
                });
                store.update('loans', loan.id, { amount_paid: loan.total_due, balance: 0, status: 'paid' });
            });
            auditLog('employer', empAuth.id, 'CHECKOFF_REMITTED', 'employers', empAuth.id, { count: activeLoans.length, total: totalDeductions });
            showToast(`Remittance of ${formatCurrency(totalDeductions)} processed for ${activeLoans.length} employee(s)!`, 'success');
            setTimeout(() => navigate('/employer'), 1500);
        });
    }, 0);

    return el;
}
