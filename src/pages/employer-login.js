// Payday — Employer Login
import { store, session } from '../utils/store.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderEmployerLogin() {
    const employers = store.getAll('employers').filter(e => e.is_active);

    const el = document.createElement('div');
    el.className = 'page flex items-center justify-center';
    el.style.minHeight = '100vh';

    el.innerHTML = `
    <div style="max-width: 400px; width: 100%; padding: 20px;">
      <div class="text-center mb-xl animate-slide-up">
        <img src="/payday-logo.png" alt="Payday" class="brand-logo-large" />
        <h1 style="font-size: 1.4rem; font-weight: 800;">Employer Portal</h1>
        <p class="text-sm text-muted">Payroll & Checkoff Management</p>
      </div>
      <div class="card card-glass animate-scale-in" style="padding: 28px;">
        <div class="form-group">
          <label class="form-label">Select Employer</label>
          <select id="emp-select" class="form-input form-select">
            <option value="">Choose employer...</option>
            ${employers.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Access Code</label>
          <input type="password" id="emp-code" class="form-input" placeholder="••••••••" value="emp123" />
        </div>
        <button id="emp-login-btn" class="btn btn-gold btn-full mt-md">Access Portal →</button>
        <p class="text-center text-xs text-muted mt-md">Demo: Select any employer, code: <strong>emp123</strong></p>
      </div>
      <div class="text-center mt-lg"><a href="#/" class="text-sm text-muted">← Back to Home</a></div>
    </div>
  `;

    setTimeout(() => {
        el.querySelector('#emp-login-btn').addEventListener('click', () => {
            const empId = el.querySelector('#emp-select').value;
            const code = el.querySelector('#emp-code').value;
            if (!empId) { showToast('Select an employer', 'error'); return; }
            if (code !== 'emp123') { showToast('Invalid access code', 'error'); return; }
            const emp = store.getById('employers', empId);
            session.setEmployerAuth({ id: empId, name: emp?.name || 'Employer' });
            showToast(`Welcome, ${emp?.name}!`, 'success');
            navigate('/employer');
        });
    }, 0);
    return el;
}
