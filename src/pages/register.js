// Payday — Registration (Multi-Step KYC)
import { store, session, auditLog } from '../utils/store.js';
import { normalizePhone } from '../utils/formatters.js';
import { simulateOTP, verifyOTP } from '../utils/mock-mpesa.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderRegister() {
  const employers = store.getAll('employers').filter(e => e.is_active);
  const el = document.createElement('div');
  el.className = 'page flex items-center justify-center';
  el.style.minHeight = '100vh';

  el.innerHTML = `
    <div class="container" style="max-width: 520px; padding: 40px 20px;">
      <div class="text-center mb-xl animate-slide-up">
        <a href="#/" class="navbar-brand justify-center mb-md" style="font-size: 1.3rem;">
          <img src="/payday-logo.png" alt="Payday" class="brand-logo" />
        </a>
        <h1 style="font-size: 1.5rem; font-weight: 800;">Create Your Account</h1>
        <p class="text-muted text-sm">Quick KYC — takes under 2 minutes</p>
      </div>

      <!-- Stepper -->
      <div class="stepper mb-xl" id="reg-stepper">
        <div class="stepper-step active" data-step="1"><span class="step-number">1</span><span class="step-label">Personal</span></div>
        <div class="stepper-line"></div>
        <div class="stepper-step" data-step="2"><span class="step-number">2</span><span class="step-label">Employment</span></div>
        <div class="stepper-line"></div>
        <div class="stepper-step" data-step="3"><span class="step-number">3</span><span class="step-label">Contact</span></div>
        <div class="stepper-line"></div>
        <div class="stepper-step" data-step="4"><span class="step-number">4</span><span class="step-label">Verify</span></div>
      </div>

      <div class="card card-glass animate-scale-in" style="padding: 28px;">
        <!-- Step 1: Personal -->
        <div class="reg-step" id="step-1">
          <h3 class="mb-md font-semibold">Personal Information</h3>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="reg-name" class="form-input" placeholder="James Kamau" />
          </div>
          <div class="form-group">
            <label class="form-label">National ID Number</label>
            <input type="text" id="reg-idno" class="form-input" placeholder="12345678" maxlength="10" />
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth</label>
            <input type="date" id="reg-dob" class="form-input" />
          </div>
          <button class="btn btn-primary btn-full mt-md step-next" data-next="2">Continue →</button>
        </div>

        <!-- Step 2: Employment -->
        <div class="reg-step hidden" id="step-2">
          <h3 class="mb-md font-semibold">Employment Details</h3>
          <div class="form-group">
            <label class="form-label">Employer / Institution</label>
            <select id="reg-employer" class="form-input form-select">
              <option value="">Select employer...</option>
              ${employers.map(e => `<option value="${e.id}">${e.name} (${e.type})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Staff / Payroll Number</label>
            <input type="text" id="reg-staffno" class="form-input" placeholder="KCB-4521" maxlength="20" />
          </div>
          <div class="form-group">
            <label class="form-label">Net Monthly Salary (KES)</label>
            <input type="number" id="reg-salary" class="form-input" placeholder="85000" min="1000" />
          </div>
          <div class="flex gap-md mt-md">
            <button class="btn btn-secondary flex-1 step-prev" data-prev="1">← Back</button>
            <button class="btn btn-primary flex-1 step-next" data-next="3">Continue →</button>
          </div>
        </div>

        <!-- Step 3: Contact -->
        <div class="reg-step hidden" id="step-3">
          <h3 class="mb-md font-semibold">Contact & Verification</h3>
          <div class="form-group">
            <label class="form-label">Phone Number (M-Pesa)</label>
            <input type="tel" id="reg-phone" class="form-input" placeholder="0712 345 678" maxlength="13" />
          </div>
          <div class="form-group">
            <label class="form-label">Set 4-Digit PIN</label>
            <input type="password" id="reg-pin" class="form-input" placeholder="••••" maxlength="4" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm PIN</label>
            <input type="password" id="reg-pin2" class="form-input" placeholder="••••" maxlength="4" />
          </div>
          <div class="form-group mt-md">
            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="reg-consent" style="margin-top: 4px; accent-color: var(--green-primary);" />
              <span class="text-sm text-muted">I accept the Terms & Conditions, consent to salary deduction mandate, and authorize data processing for loan purposes.</span>
            </label>
          </div>
          <div class="flex gap-md mt-md">
            <button class="btn btn-secondary flex-1 step-prev" data-prev="2">← Back</button>
            <button class="btn btn-primary flex-1" id="send-reg-otp-btn">Send OTP →</button>
          </div>
        </div>

        <!-- Step 4: OTP & Finish -->
        <div class="reg-step hidden" id="step-4">
          <h3 class="mb-md font-semibold">Verify Your Phone</h3>
          <p class="text-sm text-muted mb-md">Enter the OTP sent to <strong id="reg-otp-phone" class="text-green"></strong></p>
          <div class="form-group">
            <input type="text" id="reg-otp" class="form-input text-center" placeholder="• • • • • •" maxlength="6" style="font-size: 1.4rem; letter-spacing: 8px;" />
          </div>
          <button class="btn btn-primary btn-full mt-md" id="complete-reg-btn">Complete Registration →</button>
          <p class="text-center text-sm text-muted mt-sm">Demo OTP: <strong class="text-green">123456</strong></p>
        </div>
      </div>

      <div class="text-center mt-lg">
        <p class="text-sm text-muted">Already have an account? <a href="#/login" class="text-green font-semibold">Login</a></p>
      </div>
    </div>
  `;

  let currentOTP = null;

  setTimeout(() => {
    // Step navigation
    el.querySelectorAll('.step-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.next;
        if (!validateStep(btn.closest('.reg-step').id.split('-')[1])) return;
        goToStep(next);
      });
    });

    el.querySelectorAll('.step-prev').forEach(btn => {
      btn.addEventListener('click', () => goToStep(btn.dataset.prev));
    });

    // Send OTP
    el.querySelector('#send-reg-otp-btn').addEventListener('click', async () => {
      if (!validateStep('3')) return;
      const phone = normalizePhone(el.querySelector('#reg-phone').value);
      const btn2 = el.querySelector('#send-reg-otp-btn');
      btn2.disabled = true;
      btn2.innerHTML = '<span class="spinner"></span>';

      const result = await simulateOTP(phone);
      currentOTP = result.otp;
      showToast(`OTP sent! (Demo: ${result.otp})`, 'success');
      el.querySelector('#reg-otp-phone').textContent = el.querySelector('#reg-phone').value;
      goToStep('4');
    });

    // Complete registration
    el.querySelector('#complete-reg-btn').addEventListener('click', () => {
      const otpVal = el.querySelector('#reg-otp').value.trim();
      if (!verifyOTP(otpVal, currentOTP)) {
        showToast('Invalid OTP', 'error');
        return;
      }

      const phone = normalizePhone(el.querySelector('#reg-phone').value);
      const existing = store.findOne('users', u => u.phone === phone);
      if (existing) {
        showToast('Phone already registered. Please login.', 'warning');
        navigate('/login');
        return;
      }

      const user = store.create('users', {
        phone,
        id_no_enc: el.querySelector('#reg-idno').value,
        dob: el.querySelector('#reg-dob').value,
        full_name: el.querySelector('#reg-name').value,
        pin_hash: el.querySelector('#reg-pin').value,
        status: 'active',
        pin_failed_attempts: 0
      });

      const empId = el.querySelector('#reg-employer').value;
      if (empId) {
        store.create('employment', {
          user_id: user.id,
          employer_id: empId,
          staff_no: el.querySelector('#reg-staffno').value,
          net_salary: Number(el.querySelector('#reg-salary').value),
          verified: false
        });
      }

      // Consents
      ['terms', 'deduction_mandate', 'data_processing'].forEach(type => {
        store.create('consents', { user_id: user.id, consent_type: type, consent_text_version: 'v1.0', channel: 'app', accepted_at: new Date().toISOString() });
      });

      auditLog('user', user.id, 'USER_REGISTERED', 'users', user.id, { channel: 'app' });
      session.setCurrentUser(user);
      showToast('Registration successful! Welcome to Payday.', 'success');
      navigate('/dashboard');
    });

    function goToStep(step) {
      el.querySelectorAll('.reg-step').forEach(s => s.classList.add('hidden'));
      el.querySelector(`#step-${step}`).classList.remove('hidden');
      // Update stepper
      el.querySelectorAll('.stepper-step').forEach(s => {
        const sNum = Number(s.dataset.step);
        s.classList.toggle('active', sNum === Number(step));
        s.classList.toggle('completed', sNum < Number(step));
      });
    }

    function validateStep(step) {
      if (step === '1') {
        if (!el.querySelector('#reg-name').value.trim()) { showToast('Enter your full name', 'error'); return false; }
        if (!/^\d{6,10}$/.test(el.querySelector('#reg-idno').value)) { showToast('Enter a valid ID number (6-10 digits)', 'error'); return false; }
        if (!el.querySelector('#reg-dob').value) { showToast('Enter your date of birth', 'error'); return false; }
        return true;
      }
      if (step === '2') {
        if (!el.querySelector('#reg-employer').value) { showToast('Select your employer', 'error'); return false; }
        if (!el.querySelector('#reg-staffno').value.trim()) { showToast('Enter your staff number', 'error'); return false; }
        const salary = Number(el.querySelector('#reg-salary').value);
        if (!salary || salary < 1000) { showToast('Enter a valid salary', 'error'); return false; }
        return true;
      }
      if (step === '3') {
        const phone = normalizePhone(el.querySelector('#reg-phone').value);
        if (!phone || phone.length < 12) { showToast('Enter a valid phone number', 'error'); return false; }
        const pin = el.querySelector('#reg-pin').value;
        if (!/^\d{4}$/.test(pin)) { showToast('PIN must be exactly 4 digits', 'error'); return false; }
        if (pin !== el.querySelector('#reg-pin2').value) { showToast('PINs do not match', 'error'); return false; }
        if (!el.querySelector('#reg-consent').checked) { showToast('You must accept the terms & consent', 'error'); return false; }
        return true;
      }
      return true;
    }
  }, 0);

  return el;
}
