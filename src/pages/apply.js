// Payday — Loan Application (4-Step: Eligibility → Offer → Review → Disburse)
import { store, session, auditLog } from '../utils/store.js';
import { checkEligibility } from '../utils/eligibility.js';
import { calculateOffer } from '../utils/loan-calc.js';
import { simulateDisburse } from '../utils/mock-mpesa.js';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderApply() {
    const user = session.getCurrentUser();
    if (!user) { navigate('/login'); return document.createElement('div'); }

    const eligibility = checkEligibility(user.id);
    const products = store.find('loan_products', p => p.active);

    const el = document.createElement('div');
    el.className = 'page';

    el.innerHTML = `
    <nav class="navbar">
      <div class="container flex items-center justify-between">
        <a href="#/dashboard" class="navbar-brand"><img src="/payday-logo.png" alt="Payday" class="brand-logo" /> Payday</a>
        <div><a href="#/dashboard" class="btn btn-sm btn-secondary">← Dashboard</a></div>
      </div>
    </nav>

    <div class="container page-padded" style="max-width: 560px;">
      <div class="stepper mb-xl" id="apply-stepper">
        <div class="stepper-step active" data-step="1"><span class="step-number">1</span><span class="step-label">Eligibility</span></div>
        <div class="stepper-line"></div>
        <div class="stepper-step" data-step="2"><span class="step-number">2</span><span class="step-label">Offer</span></div>
        <div class="stepper-line"></div>
        <div class="stepper-step" data-step="3"><span class="step-number">3</span><span class="step-label">Review</span></div>
        <div class="stepper-line"></div>
        <div class="stepper-step" data-step="4"><span class="step-number">4</span><span class="step-label">Done</span></div>
      </div>

      <!-- Step 1: Eligibility -->
      <div class="apply-step" id="apply-step-1">
        <div class="card animate-scale-in" style="padding: 32px;">
          ${eligibility.eligible ? `
            <div class="text-center mb-lg">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--green-glow); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px; border: 2px solid var(--green-primary);">✅</div>
              <h2 style="font-size: 1.4rem; font-weight: 800;">You're Eligible!</h2>
              <p class="text-muted text-sm mt-xs">Credit Score: <strong>${10 - eligibility.score}/10</strong> · Risk Band: <strong>${eligibility.riskBand}</strong></p>
            </div>
            <div class="card" style="background: var(--bg-input); padding: 20px; border-radius: 12px;">
              <div class="text-center">
                <div class="text-sm text-muted">Your Maximum Limit</div>
                <div style="font-size: 2.5rem; font-weight: 900; color: var(--green-primary);">${formatCurrency(eligibility.limit)}</div>
                <div class="text-xs text-muted">${eligibility.employer} · Net Salary ${formatCurrency(eligibility.salary)}</div>
              </div>
            </div>
            <button class="btn btn-primary btn-full mt-lg" id="proceed-offer-btn">Choose Loan Amount →</button>
          ` : `
            <div class="text-center">
              <div style="font-size: 3rem; margin-bottom: 16px;">🚫</div>
              <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">Not Eligible</h2>
              <p class="text-muted text-sm mb-md">${eligibility.reasons.join('. ')}</p>
              <a href="#/dashboard" class="btn btn-secondary">← Back to Dashboard</a>
            </div>
          `}
        </div>
      </div>

      <!-- Step 2: Offer Builder -->
      <div class="apply-step hidden" id="apply-step-2">
        <div class="card animate-scale-in" style="padding: 32px;">
          <h2 class="mb-lg font-bold" style="font-size: 1.3rem;">Build Your Loan</h2>

          <!-- Amount slider -->
          <div class="mb-xl">
            <div class="flex justify-between mb-xs">
              <label class="form-label" style="margin: 0;">Loan Amount</label>
              <span id="amount-display" class="font-bold text-green text-lg">KES 10,000</span>
            </div>
            <input type="range" class="range-slider" id="amount-slider"
              min="2000" max="${eligibility.limit || 50000}" step="1000" value="10000" />
            <div class="flex justify-between text-xs text-muted mt-xs">
              <span>KES 2,000</span>
              <span>${formatCurrency(eligibility.limit || 50000)}</span>
            </div>
          </div>

          <!-- Term selection -->
          <div class="mb-xl">
            <label class="form-label">Loan Term</label>
            <div class="grid grid-4" style="gap: 8px;" id="tenor-options">
              ${products.map(p => `
                <button class="btn btn-secondary tenor-btn ${p.tenor_days === 30 ? 'selected' : ''}"
                  data-days="${p.tenor_days}" data-rate="${p.fee_rate}" data-pid="${p.id}"
                  style="${p.tenor_days === 30 ? 'border-color: var(--green-primary); color: var(--green-primary);' : ''}">
                  ${p.tenor_days}d<br><span class="text-xs">${formatPercent(p.fee_rate)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Live preview -->
          <div class="card" style="background: var(--bg-input); padding: 20px; border-radius: 12px;" id="offer-preview">
            <div class="grid grid-2" style="gap: 12px;">
              <div><span class="text-xs text-muted">Principal</span><div class="font-semibold" id="preview-principal">KES 10,000</div></div>
              <div><span class="text-xs text-muted">Fee</span><div class="font-semibold text-gold" id="preview-fee">KES 1,000</div></div>
              <div><span class="text-xs text-muted">Total Repayable</span><div class="font-bold text-lg" id="preview-total">KES 11,000</div></div>
              <div><span class="text-xs text-muted">Due Date</span><div class="font-semibold" id="preview-due">—</div></div>
            </div>
          </div>

          <div class="flex gap-md mt-lg">
            <button class="btn btn-secondary flex-1" id="back-elig-btn">← Back</button>
            <button class="btn btn-primary flex-1" id="proceed-review-btn">Review Offer →</button>
          </div>
        </div>
      </div>

      <!-- Step 3: Review & Accept -->
      <div class="apply-step hidden" id="apply-step-3">
        <div class="card animate-scale-in" style="padding: 32px;">
          <h2 class="mb-lg font-bold" style="font-size: 1.3rem;">Review & Accept</h2>

          <div class="card mb-md" style="background: var(--bg-input); padding: 20px; border-radius: 12px;">
            <div style="display: grid; gap: 12px;">
              <div class="flex justify-between"><span class="text-muted text-sm">Principal</span><span class="font-semibold" id="review-principal"></span></div>
              <div class="flex justify-between"><span class="text-muted text-sm">Fee</span><span class="font-semibold text-gold" id="review-fee"></span></div>
              <div class="divider" style="margin: 4px 0;"></div>
              <div class="flex justify-between"><span class="text-muted text-sm">Total Repayable</span><span class="font-bold text-green text-lg" id="review-total"></span></div>
              <div class="flex justify-between"><span class="text-muted text-sm">Loan Term</span><span class="font-semibold" id="review-tenor"></span></div>
              <div class="flex justify-between"><span class="text-muted text-sm">Due Date</span><span class="font-semibold" id="review-due"></span></div>
              <div class="flex justify-between"><span class="text-muted text-sm">Repayment</span><span class="font-semibold">Checkoff → STK</span></div>
              <div class="flex justify-between"><span class="text-muted text-sm">Disburse To</span><span class="font-semibold" id="review-phone"></span></div>
            </div>
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="apply-consent" style="margin-top: 4px; accent-color: var(--green-primary);" />
              <span class="text-sm text-muted">I accept the loan terms, authorize salary deduction, and consent to M-Pesa STK fallback on due date.</span>
            </label>
          </div>

          <div class="flex gap-md mt-lg">
            <button class="btn btn-secondary flex-1" id="back-offer-btn">← Back</button>
            <button class="btn btn-primary flex-1" id="accept-loan-btn">Accept & Disburse →</button>
          </div>
        </div>
      </div>

      <!-- Step 4: Disbursement Animation -->
      <div class="apply-step hidden" id="apply-step-4">
        <div class="card text-center animate-scale-in" style="padding: 40px;">
          <div id="disburse-animation">
            <div class="spinner" style="width: 60px; height: 60px; margin: 0 auto 20px; border-width: 4px;"></div>
            <h2 class="mb-sm">Processing Disbursement...</h2>
            <p class="text-muted text-sm" id="disburse-status">Sending to M-Pesa...</p>
          </div>
          <div id="disburse-success" class="hidden">
            <div style="font-size: 4rem; margin-bottom: 16px;">🎉</div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--green-primary); margin-bottom: 8px;">Loan Disbursed!</h2>
            <p class="text-muted text-sm mb-lg" id="disburse-message"></p>
            <div class="card" style="background: var(--bg-input); padding: 16px; border-radius: 12px; margin-bottom: 24px;">
              <div class="text-xs text-muted">Amount Sent</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--green-primary);" id="disburse-amount"></div>
            </div>
            <a href="#/dashboard" class="btn btn-primary btn-full">Go to Dashboard →</a>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-nav">
      <div class="bottom-nav-items">
        <a href="#/dashboard" class="bottom-nav-item"><span class="nav-icon">🏠</span>Home</a>
        <a href="#/apply" class="bottom-nav-item active"><span class="nav-icon">📝</span>Apply</a>
        <a href="#/repay" class="bottom-nav-item"><span class="nav-icon">💳</span>Repay</a>
        <a href="#/profile" class="bottom-nav-item"><span class="nav-icon">👤</span>Profile</a>
      </div>
    </div>
  `;

    let currentOffer = null;
    let selectedProduct = products.find(p => p.tenor_days === 30) || products[0];

    setTimeout(() => {
        if (!eligibility.eligible) return;

        const slider = el.querySelector('#amount-slider');
        const amountDisplay = el.querySelector('#amount-display');

        function updatePreview() {
            const amount = Number(slider.value);
            const offer = calculateOffer(amount, selectedProduct.tenor_days, selectedProduct.fee_rate);
            currentOffer = { ...offer, product: selectedProduct };
            amountDisplay.textContent = formatCurrency(amount);
            el.querySelector('#preview-principal').textContent = formatCurrency(offer.principal);
            el.querySelector('#preview-fee').textContent = formatCurrency(offer.fee);
            el.querySelector('#preview-total').textContent = formatCurrency(offer.totalDue);
            el.querySelector('#preview-due').textContent = formatDate(offer.dueDate);
        }

        slider.addEventListener('input', updatePreview);

        // Tenor buttons
        el.querySelectorAll('.tenor-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                el.querySelectorAll('.tenor-btn').forEach(b => {
                    b.style.borderColor = '';
                    b.style.color = '';
                    b.classList.remove('selected');
                });
                btn.style.borderColor = 'var(--green-primary)';
                btn.style.color = 'var(--green-primary)';
                btn.classList.add('selected');
                selectedProduct = { id: btn.dataset.pid, tenor_days: Number(btn.dataset.days), fee_rate: Number(btn.dataset.rate) };
                updatePreview();
            });
        });

        updatePreview(); // Initial

        // Navigation
        function goToApplyStep(n) {
            el.querySelectorAll('.apply-step').forEach(s => s.classList.add('hidden'));
            el.querySelector(`#apply-step-${n}`).classList.remove('hidden');
            el.querySelectorAll('.stepper-step').forEach(s => {
                const sN = Number(s.dataset.step);
                s.classList.toggle('active', sN === n);
                s.classList.toggle('completed', sN < n);
            });
        }

        el.querySelector('#proceed-offer-btn').addEventListener('click', () => goToApplyStep(2));
        el.querySelector('#back-elig-btn').addEventListener('click', () => goToApplyStep(1));
        el.querySelector('#back-offer-btn').addEventListener('click', () => goToApplyStep(2));

        el.querySelector('#proceed-review-btn').addEventListener('click', () => {
            if (!currentOffer) return;
            el.querySelector('#review-principal').textContent = formatCurrency(currentOffer.principal);
            el.querySelector('#review-fee').textContent = formatCurrency(currentOffer.fee);
            el.querySelector('#review-total').textContent = formatCurrency(currentOffer.totalDue);
            el.querySelector('#review-tenor').textContent = currentOffer.tenorDays + ' days';
            el.querySelector('#review-due').textContent = formatDate(currentOffer.dueDate);
            el.querySelector('#review-phone').textContent = user.phone;
            goToApplyStep(3);
        });

        el.querySelector('#accept-loan-btn').addEventListener('click', async () => {
            if (!el.querySelector('#apply-consent').checked) {
                showToast('You must accept the terms', 'error');
                return;
            }

            goToApplyStep(4);

            const employment = store.findOne('employment', e => e.user_id === user.id);

            // Create loan
            const loan = store.create('loans', {
                user_id: user.id,
                employer_id: employment?.employer_id || '',
                product_id: currentOffer.product.id,
                principal: currentOffer.principal,
                fee: currentOffer.fee,
                total_due: currentOffer.totalDue,
                amount_paid: 0,
                balance: currentOffer.totalDue,
                due_date: currentOffer.dueDate,
                status: 'active',
                disbursement_phone: user.phone,
                created_channel: 'app'
            });

            auditLog('user', user.id, 'LOAN_APPLIED', 'loans', loan.id, { amount: currentOffer.principal });

            // Simulate disbursement
            el.querySelector('#disburse-status').textContent = 'Sending to M-Pesa...';
            const result = await simulateDisburse(user.phone, currentOffer.principal);

            el.querySelector('#disburse-animation').classList.add('hidden');
            el.querySelector('#disburse-success').classList.remove('hidden');
            el.querySelector('#disburse-amount').textContent = formatCurrency(currentOffer.principal);
            el.querySelector('#disburse-message').textContent = result.message;

            if (!result.success) {
                store.update('loans', loan.id, { status: 'failed_disbursement' });
            }

            auditLog('user', user.id, 'LOAN_DISBURSED', 'loans', loan.id, { ref: result.provider_ref });
        });
    }, 0);

    return el;
}
