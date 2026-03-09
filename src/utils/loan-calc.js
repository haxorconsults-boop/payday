// Payday — Loan Calculator (Flat-Fee Model)
import { addDays, today } from './formatters.js';

// Fee rates by tenor (configurable — loaded from loan_products)
const DEFAULT_FEE_RATES = {
    7: 0.07,
    14: 0.09,
    30: 0.10,
    60: 0.15
};

// Penalty config
const GRACE_DAYS = 3;
const PENALTY_RATE = 0.03; // 3% one-time
const PENALTY_CAP = 0.10; // Max 10% of principal

export function calculateOffer(amount, tenorDays, feeRate = null) {
    const principal = Number(amount);
    const rate = feeRate || DEFAULT_FEE_RATES[tenorDays] || 0.10;
    const fee = Math.round(principal * rate);
    const totalDue = principal + fee;
    const dueDate = addDays(today(), tenorDays);

    return {
        principal,
        fee,
        feeRate: rate,
        totalDue,
        tenorDays,
        dueDate,
        repaymentPriority: ['checkoff', 'stk'],
        monthlyRate: ((rate / tenorDays) * 30 * 100).toFixed(1) + '% pm',
        dailyRate: ((rate / tenorDays) * 100).toFixed(3) + '% pd'
    };
}

export function generateSchedule(loanId, principal, fee, totalDue, dueDate) {
    // MVP: single bullet repayment
    return [{
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        loan_id: loanId,
        due_date: dueDate,
        amount_due: totalDue,
        principal_portion: principal,
        fee_portion: fee,
        status: 'due'
    }];
}

export function calculatePenalty(principal) {
    const penalty = Math.round(principal * PENALTY_RATE);
    const cap = Math.round(principal * PENALTY_CAP);
    return Math.min(penalty, cap);
}

export function getDaysOverdue(dueDate) {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
}

export function isInGracePeriod(dueDate) {
    const overdue = getDaysOverdue(dueDate);
    return overdue > 0 && overdue <= GRACE_DAYS;
}

export function getRepaymentStatus(dueDate, amountPaid, totalDue) {
    if (amountPaid >= totalDue) return 'paid';
    const overdue = getDaysOverdue(dueDate);
    if (overdue > GRACE_DAYS) return 'overdue';
    if (overdue > 0) return 'grace';
    return 'due';
}

export function formatOfferSummary(offer) {
    return `
    Principal: KES ${offer.principal.toLocaleString()}
    Fee: KES ${offer.fee.toLocaleString()} (${(offer.feeRate * 100).toFixed(0)}%)
    Total Repayable: KES ${offer.totalDue.toLocaleString()}
    Duration: ${offer.tenorDays} days
    Due Date: ${offer.dueDate}
    Repayment: Checkoff → STK Fallback
  `;
}
