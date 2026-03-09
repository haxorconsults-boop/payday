// Payday — Admin Login
import { session } from '../utils/store.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderAdminLogin() {
    const el = document.createElement('div');
    el.className = 'page flex items-center justify-center';
    el.style.minHeight = '100vh';

    el.innerHTML = `
    <div style="max-width: 400px; width: 100%; padding: 20px;">
      <div class="text-center mb-xl animate-slide-up">
        <img src="/payday-logo.png" alt="Payday" class="brand-logo-large" />
        <h1 style="font-size: 1.4rem; font-weight: 800;">Admin Console</h1>
        <p class="text-sm text-muted">Payday Management System</p>
      </div>
      <div class="card card-glass animate-scale-in" style="padding: 28px;">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="admin-email" class="form-input" placeholder="admin@ibc.co.ke" value="admin@ibc.co.ke" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="admin-pass" class="form-input" placeholder="••••••••" value="admin123" />
        </div>
        <button id="admin-login-btn" class="btn btn-primary btn-full mt-md">Login to Admin →</button>
        <p class="text-center text-xs text-muted mt-md">Demo: <strong>admin@ibc.co.ke</strong> / <strong>admin123</strong></p>
      </div>
      <div class="text-center mt-lg"><a href="#/" class="text-sm text-muted">← Back to Home</a></div>
    </div>
  `;

    setTimeout(() => {
        el.querySelector('#admin-login-btn').addEventListener('click', () => {
            const email = el.querySelector('#admin-email').value;
            const pass = el.querySelector('#admin-pass').value;
            if (email === 'admin@ibc.co.ke' && pass === 'admin123') {
                session.setAdminAuth({ email, role: 'admin', name: 'Admin User' });
                showToast('Welcome, Admin!', 'success');
                navigate('/admin');
            } else {
                showToast('Invalid credentials', 'error');
            }
        });
        el.querySelector('#admin-pass').addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('#admin-login-btn').click(); });
    }, 0);
    return el;
}
