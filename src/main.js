// Payday — Main Entry Point
import './style.css';
import { registerRoute, initRouter } from './router.js';
import { seedData } from './utils/seed-data.js';

// Import pages
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderApply } from './pages/apply.js';
import { renderLoanDetails } from './pages/loan-details.js';
import { renderRepay } from './pages/repay.js';
import { renderProfile } from './pages/profile.js';
import { renderUSSD } from './pages/ussd.js';
import { renderAdminLogin } from './pages/admin-login.js';
import { renderAdmin } from './pages/admin.js';
import { renderEmployerLogin } from './pages/employer-login.js';
import { renderEmployer } from './pages/employer.js';

// Seed demo data
seedData();

// Register routes
registerRoute('/', renderLanding);
registerRoute('/login', renderLogin);
registerRoute('/register', renderRegister);
registerRoute('/dashboard', renderDashboard);
registerRoute('/apply', renderApply);
registerRoute('/loan-details', renderLoanDetails);
registerRoute('/repay', renderRepay);
registerRoute('/profile', renderProfile);
registerRoute('/ussd', renderUSSD);
registerRoute('/admin-login', renderAdminLogin);
registerRoute('/admin', renderAdmin);
registerRoute('/employer-login', renderEmployerLogin);
registerRoute('/employer', renderEmployer);

// Initialize router
initRouter();

console.log('🚀 Payday Platform loaded');
