// Payday — Demo Seed Data
import { store, markSeeded, isSeeded } from './store.js';
import { addDays } from './formatters.js';

export function seedData() {
    if (isSeeded()) return;

    // ===== EMPLOYERS =====
    const employers = [
        { id: 'emp-001', name: 'Kenya Commercial Bank', type: 'employer', risk_band: 'A', is_active: true },
        { id: 'emp-002', name: 'Safaricom PLC', type: 'employer', risk_band: 'A', is_active: true },
        { id: 'emp-003', name: 'Government of Kenya', type: 'employer', risk_band: 'A', is_active: true },
        { id: 'emp-004', name: 'Equity Bank', type: 'employer', risk_band: 'A', is_active: true },
        { id: 'emp-005', name: 'Teachers Service Commission', type: 'employer', risk_band: 'A', is_active: true },
        { id: 'emp-006', name: 'Mwalimu National Sacco', type: 'sacco', risk_band: 'B', is_active: true },
        { id: 'emp-007', name: 'Harambee Co-op Sacco', type: 'sacco', risk_band: 'B', is_active: true },
        { id: 'emp-008', name: 'Nairobi Water & Sewerage', type: 'employer', risk_band: 'B', is_active: true },
        { id: 'emp-009', name: 'KenGen Power', type: 'employer', risk_band: 'B', is_active: true },
        { id: 'emp-010', name: 'DataTech Solutions Ltd', type: 'employer', risk_band: 'C', is_active: true },
    ];

    employers.forEach(emp => {
        const existing = store.getById('employers', emp.id);
        if (!existing) {
            const items = JSON.parse(localStorage.getItem('ibc_employers') || '[]');
            items.push({ ...emp, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
            localStorage.setItem('ibc_employers', JSON.stringify(items));
        }
    });

    // ===== LOAN PRODUCTS =====
    const products = [
        { id: 'prod-7', name: 'IBC Quick-7', tenor_days: 7, fee_rate: 0.07, min_amount: 2000, max_amount: 20000, active: true },
        { id: 'prod-14', name: 'IBC Flexi-14', tenor_days: 14, fee_rate: 0.09, min_amount: 2000, max_amount: 30000, active: true },
        { id: 'prod-30', name: 'IBC Standard-30', tenor_days: 30, fee_rate: 0.10, min_amount: 2000, max_amount: 50000, active: true },
        { id: 'prod-60', name: 'IBC Extended-60', tenor_days: 60, fee_rate: 0.15, min_amount: 5000, max_amount: 50000, active: true },
    ];

    products.forEach(prod => {
        const items = JSON.parse(localStorage.getItem('ibc_loan_products') || '[]');
        if (!items.find(i => i.id === prod.id)) {
            items.push({ ...prod, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
            localStorage.setItem('ibc_loan_products', JSON.stringify(items));
        }
    });

    // ===== DEMO USERS =====
    const now = new Date().toISOString();
    const users = [
        { id: 'user-001', phone: '254712345001', id_no_enc: '12345678', dob: '1990-06-15', full_name: 'James Kamau', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-002', phone: '254712345002', id_no_enc: '23456789', dob: '1988-02-20', full_name: 'Grace Wanjiku', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-003', phone: '254712345003', id_no_enc: '34567890', dob: '1995-11-30', full_name: 'David Ochieng', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-004', phone: '254712345004', id_no_enc: '45678901', dob: '1985-08-10', full_name: 'Mary Njeri', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-005', phone: '254712345005', id_no_enc: '56789012', dob: '1992-04-25', full_name: 'Peter Muthoni', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-006', phone: '254712345006', id_no_enc: '67890123', dob: '1991-01-12', full_name: 'Sarah Akinyi', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-007', phone: '254712345007', id_no_enc: '78901234', dob: '1987-07-08', full_name: 'John Kipchoge', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-008', phone: '254712345008', id_no_enc: '89012345', dob: '1993-03-05', full_name: 'Faith Mwende', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
        { id: 'user-009', phone: '254712345009', id_no_enc: '90123456', dob: '1989-12-18', full_name: 'Kevin Otieno', pin_hash: 'demo', status: 'locked', pin_failed_attempts: 3 },
        { id: 'user-010', phone: '254712345010', id_no_enc: '01234567', dob: '1994-09-22', full_name: 'Ann Chebet', pin_hash: 'demo', status: 'active', pin_failed_attempts: 0 },
    ];

    users.forEach(u => {
        const items = JSON.parse(localStorage.getItem('ibc_users') || '[]');
        if (!items.find(i => i.id === u.id)) {
            items.push({ ...u, created_at: now, updated_at: now });
            localStorage.setItem('ibc_users', JSON.stringify(items));
        }
    });

    // ===== EMPLOYMENT RECORDS =====
    const employments = [
        { id: 'empl-001', user_id: 'user-001', employer_id: 'emp-001', staff_no: 'KCB-4521', net_salary: 85000, verified: true, verified_at: now },
        { id: 'empl-002', user_id: 'user-002', employer_id: 'emp-002', staff_no: 'SAF-7823', net_salary: 120000, verified: true, verified_at: now },
        { id: 'empl-003', user_id: 'user-003', employer_id: 'emp-003', staff_no: 'GOK-1234', net_salary: 55000, verified: true, verified_at: now },
        { id: 'empl-004', user_id: 'user-004', employer_id: 'emp-005', staff_no: 'TSC-9012', net_salary: 62000, verified: true, verified_at: now },
        { id: 'empl-005', user_id: 'user-005', employer_id: 'emp-006', staff_no: 'MNS-3456', net_salary: 45000, verified: true, verified_at: now },
        { id: 'empl-006', user_id: 'user-006', employer_id: 'emp-004', staff_no: 'EQT-6789', net_salary: 95000, verified: true, verified_at: now },
        { id: 'empl-007', user_id: 'user-007', employer_id: 'emp-008', staff_no: 'NWS-2345', net_salary: 48000, verified: false },
        { id: 'empl-008', user_id: 'user-008', employer_id: 'emp-009', staff_no: 'KGN-8901', net_salary: 72000, verified: true, verified_at: now },
        { id: 'empl-009', user_id: 'user-009', employer_id: 'emp-010', staff_no: 'DTS-5678', net_salary: 35000, verified: false },
        { id: 'empl-010', user_id: 'user-010', employer_id: 'emp-007', staff_no: 'HCS-0123', net_salary: 38000, verified: true, verified_at: now },
    ];

    employments.forEach(e => {
        const items = JSON.parse(localStorage.getItem('ibc_employment') || '[]');
        if (!items.find(i => i.id === e.id)) {
            items.push({ ...e, created_at: now, updated_at: now });
            localStorage.setItem('ibc_employment', JSON.stringify(items));
        }
    });

    // ===== DEMO LOANS =====
    const todayStr = new Date().toISOString().split('T')[0];
    const loans = [
        // Active loans
        { id: 'loan-001', user_id: 'user-001', employer_id: 'emp-001', product_id: 'prod-30', principal: 25000, fee: 2500, total_due: 27500, amount_paid: 0, balance: 27500, due_date: addDays(todayStr, 12), status: 'active', disbursement_phone: '254712345001', created_channel: 'app' },
        { id: 'loan-002', user_id: 'user-003', employer_id: 'emp-003', product_id: 'prod-14', principal: 10000, fee: 900, total_due: 10900, amount_paid: 5000, balance: 5900, due_date: addDays(todayStr, 5), status: 'active', disbursement_phone: '254712345003', created_channel: 'ussd' },
        { id: 'loan-003', user_id: 'user-005', employer_id: 'emp-006', product_id: 'prod-7', principal: 5000, fee: 350, total_due: 5350, amount_paid: 0, balance: 5350, due_date: addDays(todayStr, 2), status: 'active', disbursement_phone: '254712345005', created_channel: 'ussd' },

        // Pending
        { id: 'loan-004', user_id: 'user-007', employer_id: 'emp-008', product_id: 'prod-30', principal: 15000, fee: 1500, total_due: 16500, amount_paid: 0, balance: 16500, due_date: addDays(todayStr, 28), status: 'pending_acceptance', disbursement_phone: '254712345007', created_channel: 'app' },

        // Overdue
        { id: 'loan-005', user_id: 'user-009', employer_id: 'emp-010', product_id: 'prod-14', principal: 8000, fee: 720, total_due: 8720, amount_paid: 0, balance: 8720, due_date: addDays(todayStr, -10), status: 'overdue', disbursement_phone: '254712345009', created_channel: 'ussd' },

        // Recently paid
        { id: 'loan-006', user_id: 'user-002', employer_id: 'emp-002', product_id: 'prod-30', principal: 40000, fee: 4000, total_due: 44000, amount_paid: 44000, balance: 0, due_date: addDays(todayStr, -5), status: 'paid', disbursement_phone: '254712345002', created_channel: 'app' },
        { id: 'loan-007', user_id: 'user-004', employer_id: 'emp-005', product_id: 'prod-14', principal: 15000, fee: 1350, total_due: 16350, amount_paid: 16350, balance: 0, due_date: addDays(todayStr, -8), status: 'paid', disbursement_phone: '254712345004', created_channel: 'ussd' },
        { id: 'loan-008', user_id: 'user-006', employer_id: 'emp-004', product_id: 'prod-7', principal: 20000, fee: 1400, total_due: 21400, amount_paid: 21400, balance: 0, due_date: addDays(todayStr, -15), status: 'paid', disbursement_phone: '254712345006', created_channel: 'app' },
        { id: 'loan-009', user_id: 'user-008', employer_id: 'emp-009', product_id: 'prod-30', principal: 30000, fee: 3000, total_due: 33000, amount_paid: 33000, balance: 0, due_date: addDays(todayStr, -20), status: 'paid', disbursement_phone: '254712345008', created_channel: 'app' },

        // Historical paid loans for scoring
        { id: 'loan-010', user_id: 'user-002', employer_id: 'emp-002', product_id: 'prod-14', principal: 20000, fee: 1800, total_due: 21800, amount_paid: 21800, balance: 0, due_date: addDays(todayStr, -40), status: 'paid', disbursement_phone: '254712345002', created_channel: 'ussd' },
        { id: 'loan-011', user_id: 'user-006', employer_id: 'emp-004', product_id: 'prod-30', principal: 15000, fee: 1500, total_due: 16500, amount_paid: 16500, balance: 0, due_date: addDays(todayStr, -50), status: 'paid', disbursement_phone: '254712345006', created_channel: 'app' },
        { id: 'loan-012', user_id: 'user-001', employer_id: 'emp-001', product_id: 'prod-14', principal: 10000, fee: 900, total_due: 10900, amount_paid: 10900, balance: 0, due_date: addDays(todayStr, -60), status: 'paid', disbursement_phone: '254712345001', created_channel: 'ussd' },
    ];

    loans.forEach(l => {
        const items = JSON.parse(localStorage.getItem('ibc_loans') || '[]');
        if (!items.find(i => i.id === l.id)) {
            items.push({ ...l, created_at: now, updated_at: now });
            localStorage.setItem('ibc_loans', JSON.stringify(items));
        }
    });

    // ===== REPAYMENTS =====
    const repayments = [
        { id: 'rep-001', loan_id: 'loan-002', amount: 5000, method: 'checkoff', reference: 'CHK-202602-001', paid_at: addDays(todayStr, -3) + 'T10:00:00Z' },
        { id: 'rep-002', loan_id: 'loan-006', amount: 44000, method: 'checkoff', reference: 'CHK-202601-006', paid_at: addDays(todayStr, -5) + 'T10:00:00Z' },
        { id: 'rep-003', loan_id: 'loan-007', amount: 16350, method: 'stk', reference: 'STK-MPESA-007', paid_at: addDays(todayStr, -8) + 'T14:30:00Z' },
        { id: 'rep-004', loan_id: 'loan-008', amount: 21400, method: 'checkoff', reference: 'CHK-202601-008', paid_at: addDays(todayStr, -15) + 'T10:00:00Z' },
        { id: 'rep-005', loan_id: 'loan-009', amount: 33000, method: 'paybill', reference: 'PBL-MPESA-009', paid_at: addDays(todayStr, -20) + 'T09:15:00Z' },
        { id: 'rep-006', loan_id: 'loan-010', amount: 21800, method: 'checkoff', reference: 'CHK-202512-010', paid_at: addDays(todayStr, -40) + 'T10:00:00Z' },
        { id: 'rep-007', loan_id: 'loan-011', amount: 16500, method: 'stk', reference: 'STK-MPESA-011', paid_at: addDays(todayStr, -50) + 'T16:45:00Z' },
        { id: 'rep-008', loan_id: 'loan-012', amount: 10900, method: 'checkoff', reference: 'CHK-202512-012', paid_at: addDays(todayStr, -60) + 'T10:00:00Z' },
    ];

    repayments.forEach(r => {
        const items = JSON.parse(localStorage.getItem('ibc_repayments') || '[]');
        if (!items.find(i => i.id === r.id)) {
            items.push({ ...r, created_at: now });
            localStorage.setItem('ibc_repayments', JSON.stringify(items));
        }
    });

    // ===== CONSENTS =====
    users.slice(0, 8).forEach((u, i) => {
        ['terms', 'deduction_mandate', 'data_processing'].forEach(type => {
            const items = JSON.parse(localStorage.getItem('ibc_consents') || '[]');
            items.push({
                id: `consent-${u.id}-${type}`,
                user_id: u.id,
                consent_type: type,
                consent_text_version: 'v1.0',
                accepted_at: now,
                channel: i % 2 === 0 ? 'ussd' : 'app',
                created_at: now
            });
            localStorage.setItem('ibc_consents', JSON.stringify(items));
        });
    });

    markSeeded();
    console.log('🌱 Payday seed data loaded successfully');
}
