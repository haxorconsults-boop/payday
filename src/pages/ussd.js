// Payday — USSD Simulator Page
import { processUSSD } from '../utils/mock-ussd.js';

export function renderUSSD() {
  const el = document.createElement('div');
  el.className = 'page';
  el.style.background = 'linear-gradient(180deg, var(--bg-primary), #0d1117)';

  el.innerHTML = `
    <nav class="navbar"><div class="container flex items-center justify-between">
      <a href="#/" class="navbar-brand"><img src="/payday-logo.png" alt="Payday" class="brand-logo" /></a>
      <div class="flex gap-sm">
        <a href="#/login" class="btn btn-sm btn-outline">Login</a>
        <a href="#/" class="btn btn-sm btn-secondary">← Home</a>
      </div>
    </div></nav>

    <div class="container page-padded text-center" style="max-width: 480px;">
      <h1 class="mb-sm animate-slide-up" style="font-size: 1.5rem; font-weight: 800;">USSD Simulator</h1>
      <p class="text-muted text-sm mb-lg">Experience Payday via feature phone — dial <strong class="text-green">*384*55#</strong></p>

      <!-- Phone -->
      <div class="ussd-phone animate-scale-in">
        <!-- Speaker -->
        <div style="width: 60px; height: 4px; background: #333; border-radius: 2px; margin: 0 auto 16px;"></div>

        <!-- Screen -->
        <div class="ussd-screen" id="ussd-screen">Payday\nDial *384*55# to start</div>

        <!-- Input Row -->
        <div class="ussd-input-row">
          <input type="text" class="ussd-input" id="ussd-input" placeholder="Enter response..." />
          <button class="ussd-send-btn" id="ussd-send">Send</button>
        </div>

        <!-- Keypad -->
        <div class="ussd-keypad">
          <button class="ussd-key" data-key="1">1<span class="key-letters">&nbsp;</span></button>
          <button class="ussd-key" data-key="2">2<span class="key-letters">ABC</span></button>
          <button class="ussd-key" data-key="3">3<span class="key-letters">DEF</span></button>
          <button class="ussd-key" data-key="4">4<span class="key-letters">GHI</span></button>
          <button class="ussd-key" data-key="5">5<span class="key-letters">JKL</span></button>
          <button class="ussd-key" data-key="6">6<span class="key-letters">MNO</span></button>
          <button class="ussd-key" data-key="7">7<span class="key-letters">PQRS</span></button>
          <button class="ussd-key" data-key="8">8<span class="key-letters">TUV</span></button>
          <button class="ussd-key" data-key="9">9<span class="key-letters">WXYZ</span></button>
          <button class="ussd-key" data-key="*">*<span class="key-letters">&nbsp;</span></button>
          <button class="ussd-key" data-key="0">0<span class="key-letters">+</span></button>
          <button class="ussd-key" data-key="#">#<span class="key-letters">&nbsp;</span></button>
        </div>

        <!-- Action buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
          <button class="ussd-key" id="ussd-clear" style="background: #4a1a1a; color: #ff5252; font-size: 13px;">✕ Clear</button>
          <button class="ussd-key" id="ussd-dial" style="background: #1a4a1a; color: #33ff33; font-size: 13px;">📞 Dial</button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="card mt-xl" style="text-align: left; padding: 20px;">
        <h3 class="font-semibold mb-sm text-sm">📋 How to Use</h3>
        <ul class="text-sm text-muted" style="list-style: none; display: grid; gap: 6px;">
          <li>1️⃣ Click <strong>Dial</strong> or press <strong>Send</strong> to start a session</li>
          <li>2️⃣ Enter your menu choice (1-6) and click <strong>Send</strong></li>
          <li>3️⃣ Follow the prompts to Register, Apply, or Repay</li>
          <li>4️⃣ Demo phone: <strong class="text-green">0712 345 001</strong></li>
          <li>5️⃣ Demo PIN: <strong class="text-green">1234</strong></li>
        </ul>
      </div>
    </div>
  `;

  setTimeout(() => {
    const screen = el.querySelector('#ussd-screen');
    const input = el.querySelector('#ussd-input');
    let sessionText = ''; // Accumulated USSD text path
    let sessionActive = false;
    const demoPhone = '254712345001';

    function displayResponse(response) {
      const isEnd = response.startsWith('END');
      const text = response.replace(/^(CON|END)\s*/, '');
      screen.textContent = text;
      screen.scrollTop = screen.scrollHeight;

      if (isEnd) {
        sessionActive = false;
        sessionText = '';
        input.placeholder = 'Session ended. Dial again.';
      } else {
        input.placeholder = 'Enter response...';
      }
      input.value = '';
      input.focus();
    }

    function startSession() {
      sessionText = '';
      sessionActive = true;
      const response = processUSSD('', demoPhone);
      displayResponse(response);
    }

    function sendInput() {
      const val = input.value.trim();
      if (!sessionActive) {
        startSession();
        return;
      }
      if (!val) return;

      if (sessionText === '') {
        sessionText = val;
      } else {
        sessionText += '*' + val;
      }

      const response = processUSSD(sessionText, demoPhone);
      displayResponse(response);
    }

    // Keypad
    el.querySelectorAll('.ussd-key[data-key]').forEach(key => {
      key.addEventListener('click', () => {
        input.value += key.dataset.key;
        input.focus();
      });
    });

    el.querySelector('#ussd-send').addEventListener('click', sendInput);
    el.querySelector('#ussd-dial').addEventListener('click', startSession);
    el.querySelector('#ussd-clear').addEventListener('click', () => {
      input.value = '';
      input.focus();
    });

    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendInput(); });
  }, 0);

  return el;
}
