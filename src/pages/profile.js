// Payday — User Profile & Settings
import { store, session } from '../utils/store.js';
import { formatCurrency, formatDate, formatPhone, statusLabel, statusBadgeClass } from '../utils/formatters.js';
import { navigate } from '../router.js';

export function renderProfile() {
    const user = session.getCurrentUser();
    if (!user) { navigate('/login'); return document.createElement('div'); }
    const freshUser = store.getById('users', user.id) || user;
    const employment = store.findOne('employment', e => e.user_id === user.id);
    const employer = employment ? store.getById('employers', employment.employer_id) : null;
    const allLoans = store.find('loans', l => l.user_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const el = document.createElement('div');
    el.className = 'page';
    el.innerHTML = `
    <nav class="navbar"><div class="container flex items-center justify-between">
      <a href="#/dashboard" class="navbar-brand"><img src="/payday-logo.png" alt="Payday" class="brand-logo" /> Payday</a>
      <a href="#/dashboard" class="btn btn-sm btn-secondary">← Back</a>
    </div></nav>
    <div class="container page-padded" style="max-width: 640px;">
      <h1 class="mb-lg animate-slide-up" style="font-size: 1.5rem; font-weight: 800;">My Profile</h1>

      <!-- Avatar -->
      <div class="card text-center mb-lg animate-scale-in" style="padding: 32px;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--green-primary), var(--gold-primary)); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: #000; margin: 0 auto 16px;">
          ${(freshUser.full_name || 'U').charAt(0).toUpperCase()}
        </div>
        <h2 style="font-size: 1.3rem; font-weight: 700;">${freshUser.full_name || 'User'}</h2>
        <p class="text-sm text-muted">${formatPhone(freshUser.phone)}</p>
        <span class="badge badge-success mt-sm">${freshUser.status?.toUpperCase()}</span>
      </div>

      <!-- Personal Info -->
      <div class="card mb-lg animate-fade-in" style="padding: 24px;">
        <h3 class="font-semibold mb-md">Personal Information</h3>
        <div style="display: grid; gap: 14px;">
          <div class="flex justify-between"><span class="text-sm text-muted">Full Name</span><span class="font-medium">${freshUser.full_name || '—'}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">Phone</span><span class="font-medium">${formatPhone(freshUser.phone)}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">ID Number</span><span class="font-medium">****${(freshUser.id_no_enc || '').slice(-4)}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">Date of Birth</span><span class="font-medium">${formatDate(freshUser.dob)}</span></div>
        </div>
      </div>

      <!-- Employment -->
      <div class="card mb-lg animate-fade-in" style="padding: 24px;">
        <h3 class="font-semibold mb-md">Employment Details</h3>
        ${employment ? `
        <div style="display: grid; gap: 14px;">
          <div class="flex justify-between"><span class="text-sm text-muted">Employer</span><span class="font-medium">${employer?.name || '—'}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">Staff Number</span><span class="font-medium">${employment.staff_no}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">Net Salary</span><span class="font-medium">${formatCurrency(employment.net_salary)}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">Verified</span><span class="font-medium">${employment.verified ? '<span class="text-green">✅ Yes</span>' : '<span class="text-gold">⏳ Pending</span>'}</span></div>
          <div class="flex justify-between"><span class="text-sm text-muted">Risk Band</span><span class="badge badge-info">${employer?.risk_band || '—'}</span></div>
        </div>
        ` : '<p class="text-sm text-muted">No employment record.</p>'}
      </div>

      <!-- Loan History -->
      <div class="card mb-lg animate-fade-in" style="padding: 24px;">
        <h3 class="font-semibold mb-md">Loan History (${allLoans.length})</h3>
        ${allLoans.length > 0 ? `
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Balance</th></tr></thead>
            <tbody>
              ${allLoans.map(l => `
                <tr>
                  <td class="text-sm">${formatDate(l.created_at)}</td>
                  <td class="font-semibold">${formatCurrency(l.principal)}</td>
                  <td><span class="badge ${statusBadgeClass(l.status)}">${statusLabel(l.status)}</span></td>
                  <td>${formatCurrency(l.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : '<p class="text-sm text-muted">No loans yet.</p>'}
      </div>

      <!-- Logout -->
      <button id="profile-logout" class="btn btn-danger btn-full mb-xl">Logout</button>
    </div>
    <div class="bottom-nav"><div class="bottom-nav-items">
      <a href="#/dashboard" class="bottom-nav-item"><span class="nav-icon">🏠</span>Home</a>
      <a href="#/apply" class="bottom-nav-item"><span class="nav-icon">📝</span>Apply</a>
      <a href="#/repay" class="bottom-nav-item"><span class="nav-icon">💳</span>Repay</a>
      <a href="#/profile" class="bottom-nav-item active"><span class="nav-icon">👤</span>Profile</a>
    </div></div>
  `;

    setTimeout(() => {
        el.querySelector('#profile-logout')?.addEventListener('click', () => { session.logout(); navigate('/'); });
    }, 0);
    return el;
}
