// Payday — Repay Page (STK Push + Paybill)
import { store, session, auditLog } from '../utils/store.js';
import { formatCurrency } from '../utils/formatters.js';
import { simulateSTKPush } from '../utils/mock-mpesa.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderRepay() {
  const user = session.getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }
  const loan = store.findOne('loans', l => l.user_id === user.id && ['active', 'overdue'].includes(l.status));

  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = `
    <nav class="navbar"><div class="container flex items-center justify-between">
      <a href="#/dashboard" class="navbar-brand"><img src="/payday-logo.png" alt="Payday" class="brand-logo" /></a>
      <a href="#/dashboard" class="btn btn-sm btn-secondary">← Back</a>
    </div></nav>
    <div class="container page-padded" style="max-width: 520px;">
      ${!loan ? `
      <div class="card text-center" style="padding: 48px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">✅</div>
        <h2 class="mb-sm">No Outstanding Loan</h2>
        <p class="text-muted text-sm mb-lg">You don't have an active loan to repay.</p>
        <a href="#/dashboard" class="btn btn-secondary">← Dashboard</a>
      </div>` : `
      <h1 class="mb-lg animate-slide-up" style="font-size: 1.5rem; font-weight: 800;">Make a Payment</h1>

      <!-- Balance -->
      <div class="card card-glow text-center mb-lg animate-scale-in" style="padding: 28px;">
        <div class="text-sm text-muted">Outstanding Balance</div>
        <div style="font-size: 2.2rem; font-weight: 900; color: var(--green-primary);">${formatCurrency(loan.balance)}</div>
      </div>

      <!-- Payment Tabs -->
      <div class="flex gap-sm mb-lg">
        <button class="btn btn-primary flex-1 pay-tab active-tab" data-tab="stk" id="stk-tab-btn">📱 STK Push</button>
        <button class="btn btn-secondary flex-1 pay-tab" data-tab="paybill" id="paybill-tab-btn">🏦 Paybill</button>
      </div>

      <!-- STK Tab -->
      <div id="stk-panel" class="card animate-fade-in" style="padding: 28px;">
        <h3 class="font-semibold mb-md">M-Pesa STK Push</h3>
        <p class="text-sm text-muted mb-md">A payment prompt will be sent to your phone. Enter your M-Pesa PIN to complete.</p>
        <div class="form-group">
          <label class="form-label">Amount (KES)</label>
          <input type="number" id="stk-amount" class="form-input" value="${loan.balance}" min="1" max="${loan.balance}" />
        </div>
        <div class="flex gap-sm mb-md">
          <button class="btn btn-secondary btn-sm quick-amt" data-amt="${Math.min(1000, loan.balance)}">1K</button>
          <button class="btn btn-secondary btn-sm quick-amt" data-amt="${Math.min(5000, loan.balance)}">5K</button>
          <button class="btn btn-secondary btn-sm quick-amt" data-amt="${Math.min(loan.balance, loan.balance)}">Full</button>
        </div>
        <button class="btn btn-primary btn-full" id="send-stk-btn">Send STK Push →</button>

        <!-- STK Animation -->
        <div id="stk-animation" class="hidden mt-lg">
          <div class="mpesa-phone" style="width: 180px; height: 300px; padding: 16px;">
            <div class="mpesa-screen-content" id="stk-screen">
              <div class="mpesa-logo">📱</div>
              <div id="stk-step-text">Initiating...</div>
            </div>
          </div>
          <p class="text-sm text-muted mt-md" id="stk-step-label">Connecting to M-Pesa...</p>
        </div>
      </div>

      <!-- Paybill Tab -->
      <div id="paybill-panel" class="card hidden" style="padding: 28px;">
        <h3 class="font-semibold mb-md">Paybill Details</h3>
        <p class="text-sm text-muted mb-lg">Use these details on your M-Pesa menu:</p>
        <div style="display: grid; gap: 16px;">
          <div class="card" style="background: var(--bg-input); padding: 16px; border-radius: 10px;">
            <div class="text-xs text-muted">Paybill Number</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--green-primary);">123456</div>
          </div>
          <div class="card" style="background: var(--bg-input); padding: 16px; border-radius: 10px;">
            <div class="text-xs text-muted">Account Number</div>
            <div style="font-size: 1.3rem; font-weight: 700;">${user.phone}</div>
          </div>
          <div class="card" style="background: var(--bg-input); padding: 16px; border-radius: 10px;">
            <div class="text-xs text-muted">Amount</div>
            <div style="font-size: 1.3rem; font-weight: 700;">${formatCurrency(loan.balance)}</div>
          </div>
        </div>
        <p class="text-sm text-muted mt-lg">Go to M-Pesa → Lipa na M-Pesa → Pay Bill → Enter details above.</p>
      </div>
      `}
    </div>
    <div class="bottom-nav"><div class="bottom-nav-items">
      <a href="#/dashboard" class="bottom-nav-item"><span class="nav-icon">🏠</span>Home</a>
      <a href="#/apply" class="bottom-nav-item"><span class="nav-icon">📝</span>Apply</a>
      <a href="#/repay" class="bottom-nav-item active"><span class="nav-icon">💳</span>Repay</a>
      <a href="#/profile" class="bottom-nav-item"><span class="nav-icon">👤</span>Profile</a>
    </div></div>
  `;

  if (!loan) return el;

  setTimeout(() => {
    // Tab switching
    el.querySelectorAll('.pay-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('.pay-tab').forEach(t => { t.classList.remove('active-tab'); t.className = t.className.replace('btn-primary', 'btn-secondary'); });
        tab.classList.add('active-tab');
        tab.className = tab.className.replace('btn-secondary', 'btn-primary');
        el.querySelector('#stk-panel').classList.toggle('hidden', tab.dataset.tab !== 'stk');
        el.querySelector('#paybill-panel').classList.toggle('hidden', tab.dataset.tab !== 'paybill');
      });
    });

    // Quick amounts
    el.querySelectorAll('.quick-amt').forEach(btn => {
      btn.addEventListener('click', () => el.querySelector('#stk-amount').value = btn.dataset.amt);
    });

    // STK Push
    el.querySelector('#send-stk-btn')?.addEventListener('click', async () => {
      const amt = Number(el.querySelector('#stk-amount').value);
      if (!amt || amt <= 0 || amt > loan.balance) { showToast('Enter a valid amount', 'error'); return; }

      el.querySelector('#send-stk-btn').disabled = true;
      el.querySelector('#stk-animation').classList.remove('hidden');

      const result = await simulateSTKPush(user.phone, amt, (step, msg) => {
        const screen = el.querySelector('#stk-step-text');
        const label = el.querySelector('#stk-step-label');
        if (screen) {
          const icons = { initiating: '📡', pin_prompt: '🔐', processing: '⏳', success: '✅', failed: '❌' };
          screen.innerHTML = `<div style="font-size:2rem;margin-bottom:8px;">${icons[step] || '📱'}</div>${msg}`;
        }
        if (label) label.textContent = msg;
      });

      if (result.success) {
        store.create('repayments', {
          loan_id: loan.id, amount: amt, method: 'stk',
          reference: result.reference, paid_at: new Date().toISOString()
        });
        const newPaid = (Number(loan.amount_paid) || 0) + amt;
        const newBal = Math.max(0, loan.total_due - newPaid);
        store.update('loans', loan.id, { amount_paid: newPaid, balance: newBal, status: newBal <= 0 ? 'paid' : loan.status });
        auditLog('user', user.id, 'REPAYMENT_STK', 'loans', loan.id, { amount: amt, ref: result.reference });
        showToast(`Payment of ${formatCurrency(amt)} received!`, 'success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        showToast('Payment failed. Please try again.', 'error');
        el.querySelector('#send-stk-btn').disabled = false;
      }
    });
  }, 0);

  return el;
}
