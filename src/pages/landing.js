// Payday — Landing Page
export function renderLanding() {
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = `
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="container flex items-center justify-between">
        <a href="#/" class="navbar-brand">
          <img src="/payday-logo.png" alt="Payday" class="brand-logo" />
        </a>
        <ul class="navbar-nav" id="landing-nav">
          <li><a href="#/">Home</a></li>
          <li><a href="#/ussd">USSD Simulator</a></li>
          <li><a href="#/admin-login">Admin</a></li>
          <li><a href="#/employer-login">Employer Portal</a></li>
        </ul>
        <div class="navbar-actions">
          <a href="#/login" class="btn btn-outline btn-sm">Login</a>
          <a href="#/register" class="btn btn-primary btn-sm">Get Started</a>
        </div>
        <button class="menu-toggle" id="menu-toggle-btn">☰</button>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero" style="padding: 80px 0 60px; position: relative; overflow: hidden;">
      <div class="container text-center" style="position: relative; z-index: 1;">
        <div class="animate-slide-up">
          <span class="badge badge-success mb-lg" style="font-size: 0.8rem; padding: 6px 16px;">🇰🇪 Kenya's Smartest Salary Loan</span>
          <h1 style="font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px;">
            Get Paid<br>
            <span class="text-green">Before Payday</span>
          </h1>
          <p style="font-size: 1.15rem; color: var(--text-secondary); max-width: 520px; margin: 0 auto 32px; line-height: 1.7;">
            Instant loans for salaried employees. Repay via employer checkoff deduction. Apply in 2 minutes via USSD or App.
          </p>
          <div class="flex gap-md justify-center flex-wrap">
            <a href="#/register" class="btn btn-primary btn-lg">Apply Now →</a>
            <a href="#/ussd" class="btn btn-secondary btn-lg">Try USSD Demo</a>
          </div>
          <p class="mt-lg text-sm text-muted">Dial <strong class="text-green">*384*55#</strong> from any phone</p>
        </div>
      </div>
      <!-- Gradient orbs -->
      <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -150px; left: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,193,7,0.05) 0%, transparent 70%); border-radius: 50%;"></div>
    </section>

    <!-- STATS BAR -->
    <section style="padding: 40px 0; background: var(--bg-secondary); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <div class="grid grid-4 text-center" style="gap: 32px;">
          <div class="animate-fade-in">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--green-primary);">10K+</div>
            <div class="text-sm text-muted">Active Borrowers</div>
          </div>
          <div class="animate-fade-in">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--gold-primary);">KES 850M</div>
            <div class="text-sm text-muted">Disbursed</div>
          </div>
          <div class="animate-fade-in">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--green-primary);">98%</div>
            <div class="text-sm text-muted">Repayment Rate</div>
          </div>
          <div class="animate-fade-in">
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--gold-primary);">2 min</div>
            <div class="text-sm text-muted">Avg. Approval</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section style="padding: 80px 0;">
      <div class="container">
        <h2 class="text-center mb-xl" style="font-size: 2rem; font-weight: 800;">Why <span class="text-green">Payday</span>?</h2>
        <div class="grid grid-3" style="gap: 24px;">
          ${featureCard('⚡', 'Instant Disbursement', 'Get funds in your M-Pesa within minutes of approval. No paperwork, no queues.', 'var(--green-primary)')}
          ${featureCard('🛡️', 'Payroll-Backed Security', 'Your employer deducts repayment from salary — lowest risk, lowest rates in the market.', 'var(--gold-primary)')}
          ${featureCard('📱', 'USSD + App Access', 'Apply from any phone via *384*55# or use our smart app for richer experience.', 'var(--status-info)')}
          ${featureCard('💰', 'Transparent Pricing', 'Flat fees from 7%. No hidden charges. See exactly what you pay before accepting.', 'var(--green-primary)')}
          ${featureCard('🔄', 'Hybrid Repayment', 'Primary checkoff deduction + M-Pesa STK fallback ensures you never miss a payment.', 'var(--gold-primary)')}
          ${featureCard('📊', 'Build Credit History', 'Every on-time repayment improves your limit. Graduate to larger loans over time.', 'var(--status-info)')}
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section style="padding: 80px 0; background: var(--bg-secondary); border-top: 1px solid var(--border-color);">
      <div class="container">
        <h2 class="text-center mb-xl" style="font-size: 2rem; font-weight: 800;">How It Works</h2>
        <div class="grid grid-4" style="gap: 20px;">
          ${stepCard(1, 'Register', 'Sign up with your ID, phone, employer, and staff number. Takes 60 seconds.', 'var(--green-primary)')}
          ${stepCard(2, 'Check Limit', 'We verify your employment and calculate your eligible loan amount instantly.', 'var(--gold-primary)')}
          ${stepCard(3, 'Get Funds', 'Accept the offer and receive money in your M-Pesa immediately.', 'var(--green-primary)')}
          ${stepCard(4, 'Auto-Repay', 'Your employer deducts from salary. If delayed, M-Pesa STK fallback kicks in.', 'var(--gold-primary)')}
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section style="padding: 80px 0;">
      <div class="container container-md">
        <h2 class="text-center mb-xl" style="font-size: 2rem; font-weight: 800;">Simple, <span class="text-green">Transparent</span> Pricing</h2>
        <div class="table-wrapper">
          <table class="table" id="pricing-table">
            <thead>
              <tr>
                <th>Loan Term</th>
                <th>Fee Rate</th>
                <th>Example (KES 10,000)</th>
                <th>You Repay</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>7 days</strong></td>
                <td><span class="text-green font-semibold">7%</span></td>
                <td>Fee: KES 700</td>
                <td class="font-bold">KES 10,700</td>
              </tr>
              <tr>
                <td><strong>14 days</strong></td>
                <td><span class="text-green font-semibold">9%</span></td>
                <td>Fee: KES 900</td>
                <td class="font-bold">KES 10,900</td>
              </tr>
              <tr>
                <td><strong>30 days</strong></td>
                <td><span class="text-green font-semibold">10%</span></td>
                <td>Fee: KES 1,000</td>
                <td class="font-bold">KES 11,000</td>
              </tr>
              <tr>
                <td><strong>60 days</strong></td>
                <td><span class="text-green font-semibold">15%</span></td>
                <td>Fee: KES 1,500</td>
                <td class="font-bold">KES 11,500</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-center text-sm text-muted mt-md">No hidden fees · No compounding · No penalties within 3-day grace period</p>
      </div>
    </section>

    <!-- CTA -->
    <section style="padding: 80px 0; background: linear-gradient(135deg, rgba(0,200,83,0.05), rgba(255,193,7,0.03)); border-top: 1px solid var(--border-color);">
      <div class="container text-center">
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 16px;">Ready to Get Started?</h2>
        <p class="text-muted mb-lg" style="max-width: 400px; margin: 0 auto 32px;">Join thousands of Kenyan employees who trust Payday for instant salary loans.</p>
        <div class="flex gap-md justify-center flex-wrap">
          <a href="#/register" class="btn btn-primary btn-lg">Create Account</a>
          <a href="#/ussd" class="btn btn-gold btn-lg">📱 Try USSD Demo</a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="padding: 40px 0; border-top: 1px solid var(--border-color);">
      <div class="container">
        <div class="flex justify-between items-center flex-wrap gap-lg">
          <div>
            <div class="flex items-center gap-sm mb-sm">
              <img src="/payday-logo.png" alt="Payday" class="brand-logo footer-logo" />
            </div>
            <p class="text-sm text-muted">Instant short-term loans for salaried employees.</p>
          </div>
          <div class="text-sm text-muted">
            © 2026 Payday. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  `;

  // Mobile menu toggle
  setTimeout(() => {
    const toggle = el.querySelector('#menu-toggle-btn');
    const nav = el.querySelector('#landing-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }, 0);

  return el;
}

function featureCard(icon, title, desc, color) {
  return `
    <div class="card" style="padding: 28px;">
      <div style="width: 48px; height: 48px; border-radius: 12px; background: ${color}15; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 16px;">
        ${icon}
      </div>
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">${title}</h3>
      <p class="text-sm text-muted" style="line-height: 1.6;">${desc}</p>
    </div>
  `;
}

function stepCard(num, title, desc, color) {
  return `
    <div class="text-center" style="padding: 20px;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: ${color}; color: #000; font-weight: 900; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 20px ${color}40;">
        ${num}
      </div>
      <h4 style="font-weight: 700; margin-bottom: 8px;">${title}</h4>
      <p class="text-sm text-muted" style="line-height: 1.6;">${desc}</p>
    </div>
  `;
}
