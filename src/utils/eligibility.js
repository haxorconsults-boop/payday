// Payday — Eligibility Scoring Engine
// Score 0-10: 0-3 low risk, 4-5 medium, 6-7 high, 8+ block
import { store } from './store.js';

const RISK_BAND_PERCENTAGES = { A: 0.40, B: 0.35, C: 0.30, D: 0.20 };
const RISK_BAND_BASE_SCORE = { A: 1, B: 2, C: 3, D: 5 };
const ABSOLUTE_MAX = 50000;
const ABSOLUTE_MIN = 2000;
const SALARY_MIN_THRESHOLD = 10000;

export function checkEligibility(userId) {
    const user = store.getById('users', userId);
    if (!user || user.status !== 'active') {
        return { eligible: false, score: 10, maxAmount: 0, limit: 0, reasons: ['User not active or not found'] };
    }

    const employment = store.findOne('employment', e => e.user_id === userId);
    if (!employment) {
        return { eligible: false, score: 10, maxAmount: 0, limit: 0, reasons: ['No employment record found'] };
    }

    const employer = store.getById('employers', employment.employer_id);
    if (!employer || !employer.is_active) {
        return { eligible: false, score: 10, maxAmount: 0, limit: 0, reasons: ['Employer not active'] };
    }

    const netSalary = Number(employment.net_salary) || 0;
    if (netSalary < SALARY_MIN_THRESHOLD) {
        return { eligible: false, score: 8, maxAmount: 0, limit: 0, reasons: [`Net salary below KES ${SALARY_MIN_THRESHOLD.toLocaleString()} threshold`] };
    }

    // Check for existing open loan
    const openLoan = store.findOne('loans', l =>
        l.user_id === userId && ['pending_acceptance', 'active', 'overdue'].includes(l.status)
    );
    if (openLoan) {
        return { eligible: false, score: 0, maxAmount: 0, limit: 0, reasons: ['You have an existing active loan'] };
    }

    // ---- Calculate risk score ----
    let riskScore = RISK_BAND_BASE_SCORE[employer.risk_band] || 3;
    const reasons = [];

    // Behavior scoring
    const allLoans = store.find('loans', l => l.user_id === userId);
    const paidLoans = allLoans.filter(l => l.status === 'paid');
    const overdueHistory = allLoans.filter(l => l.status === 'overdue' || l.was_overdue);

    if (allLoans.length === 0) {
        riskScore += 1; // First-time borrower
        reasons.push('New borrower (+1)');
    } else if (paidLoans.length >= 4) {
        riskScore -= 2;
        reasons.push('Excellent history (-2)');
    } else if (paidLoans.length >= 2) {
        riskScore -= 1;
        reasons.push('Good history (-1)');
    }

    if (overdueHistory.length > 1) {
        riskScore += 2;
        reasons.push('Multiple late payments (+2)');
    } else if (overdueHistory.length === 1) {
        riskScore += 1;
        reasons.push('Previous late payment (+1)');
    }

    // Employment verification
    if (!employment.verified) {
        if (['C', 'D'].includes(employer.risk_band)) {
            riskScore += 1;
            reasons.push('Unverified employment in low-band employer (+1)');
        }
    }

    // Clamp score
    riskScore = Math.max(0, Math.min(10, riskScore));

    // Decision
    let limitMultiplier = 1.0;
    if (riskScore >= 8) {
        return { eligible: false, score: riskScore, maxAmount: 0, limit: 0, reasons: ['Risk score too high — blocked'] };
    } else if (riskScore >= 6) {
        limitMultiplier = 0.5;
        reasons.push('Manual review recommended');
    } else if (riskScore >= 4) {
        limitMultiplier = 0.7;
    }

    // Calculate limit
    const bandPct = RISK_BAND_PERCENTAGES[employer.risk_band] || 0.30;
    const rawLimit = netSalary * bandPct;
    const adjustedLimit = Math.floor(rawLimit * limitMultiplier);
    const finalLimit = Math.min(ABSOLUTE_MAX, Math.max(ABSOLUTE_MIN, adjustedLimit));

    // Get allowed products
    const products = store.find('loan_products', p => p.active && finalLimit >= p.min_amount);

    return {
        eligible: true,
        score: riskScore,
        maxAmount: finalLimit,
        limit: finalLimit,
        salary: netSalary,
        employer: employer.name,
        riskBand: employer.risk_band,
        reasons,
        allowedProducts: products.map(p => ({
            product_id: p.id,
            name: p.name,
            tenor_days: p.tenor_days,
            fee_rate: p.fee_rate
        }))
    };
}
