// Payday — Login Page (Phone + OTP)
import { store, session } from '../utils/store.js';
import { normalizePhone } from '../utils/formatters.js';
import { simulateOTP, verifyOTP } from '../utils/mock-mpesa.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderLogin() {
  const el = document.createElement('div');
  el.className = 'page flex items-center justify-center';
  el.style.minHeight = '100vh';
  el.style.background = 'var(--bg-primary)';

  el.innerHTML = `
    <div class="container container-sm" style="max-width: 420px; padding: 40px 20px;">
      <div class="text-center mb-xl animate-slide-up">
        <a href="#/" class="navbar-brand justify-center mb-lg" style="font-size: 1.5rem;">
          <img src="/payday-logo.png" alt="Payday" class="brand-logo" />
        </a>
        <h1 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 8px;">Welcome Back</h1>
        <p class="text-muted text-sm">Sign in with your phone number</p>
      </div>

      <div class="card card-glass animate-scale-in" style="padding: 32px;">
        <!-- Phone Step -->
        <div id="phone-step">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="login-phone" class="form-input" placeholder="0712 345 678" maxlength="13" autofocus />
          </div>
          <button id="send-otp-btn" class="btn btn-primary btn-full mt-md">Send OTP →</button>
        </div>

        <!-- OTP Step -->
        <div id="otp-step" class="hidden">
          <p class="text-sm text-muted mb-md">Enter the 6-digit code sent to <strong id="otp-phone-display" class="text-green"></strong></p>
          <div class="form-group">
            <label class="form-label">OTP Code</label>
            <input type="text" id="login-otp" class="form-input text-center" placeholder="• • • • • •" maxlength="6" style="font-size: 1.5rem; letter-spacing: 8px;" />
          </div>
          <button id="verify-otp-btn" class="btn btn-primary btn-full mt-md">Verify & Login →</button>
          <div class="text-center mt-md">
            <button id="resend-otp-btn" class="text-sm text-muted" style="background: none; border: none; cursor: pointer;">Resend Code</button>
          </div>
        </div>

        <div class="divider"></div>

        <p class="text-center text-sm text-muted">
          Demo: Use any registered phone or <strong class="text-green">0712 345 001</strong><br>
          OTP: <strong class="text-green">123456</strong> always works
        </p>
      </div>

      <div class="text-center mt-lg">
        <p class="text-sm text-muted">Don't have an account? <a href="#/register" class="text-green font-semibold">Register</a></p>
      </div>
    </div>
  `;

  let currentOTP = null;

  setTimeout(() => {
    const phoneInput = el.querySelector('#login-phone');
    const sendBtn = el.querySelector('#send-otp-btn');
    const otpInput = el.querySelector('#login-otp');
    const verifyBtn = el.querySelector('#verify-otp-btn');
    const resendBtn = el.querySelector('#resend-otp-btn');
    const phoneStep = el.querySelector('#phone-step');
    const otpStep = el.querySelector('#otp-step');
    const otpPhoneDisplay = el.querySelector('#otp-phone-display');

    sendBtn.addEventListener('click', async () => {
      const phone = normalizePhone(phoneInput.value);
      if (!phone || phone.length < 12) {
        showToast('Enter a valid phone number', 'error');
        return;
      }

      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span class="spinner"></span> Sending...';

      const result = await simulateOTP(phone);
      currentOTP = result.otp;

      showToast(`OTP sent! (Demo: ${result.otp})`, 'success');
      otpPhoneDisplay.textContent = phoneInput.value;
      phoneStep.classList.add('hidden');
      otpStep.classList.remove('hidden');
      otpInput.focus();
    });

    verifyBtn.addEventListener('click', () => {
      const otpValue = otpInput.value.trim();
      if (!verifyOTP(otpValue, currentOTP)) {
        showToast('Invalid OTP. Try again.', 'error');
        return;
      }

      const phone = normalizePhone(phoneInput.value);
      const user = store.findOne('users', u => u.phone === phone);

      if (!user) {
        showToast('No account found. Please register first.', 'warning');
        navigate('/register');
        return;
      }

      session.setCurrentUser(user);
      showToast(`Welcome back, ${user.full_name || 'User'}!`, 'success');
      navigate('/dashboard');
    });

    resendBtn.addEventListener('click', async () => {
      const phone = normalizePhone(phoneInput.value);
      const result = await simulateOTP(phone);
      currentOTP = result.otp;
      showToast(`OTP resent! (Demo: ${result.otp})`, 'info');
    });

    phoneInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });
    otpInput.addEventListener('keydown', e => { if (e.key === 'Enter') verifyBtn.click(); });
  }, 0);

  return el;
}
