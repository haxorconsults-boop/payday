// Payday — USSD Menu Tree State Machine
import { store } from './store.js';
import { checkEligibility } from './eligibility.js';
import { calculateOffer } from './loan-calc.js';
import { normalizePhone, formatCurrency } from './formatters.js';

const EMPLOYER_MAP = {
    '1': 'emp-001', // KCB
    '2': 'emp-002', // Safaricom
    '3': 'emp-006', // Mwalimu Sacco
};

const AMOUNT_MAP = { '1': 2000, '2': 5000, '3': 10000, '4': 20000 };
const TENOR_MAP = { '1': 7, '2': 14, '3': 30, '4': 30 };

export function processUSSD(text, phone) {
    const normalPhone = normalizePhone(phone) || '254700000000';
    const parts = text === '' ? [] : text.split('*');
    const len = parts.length;

    if (len === 0) {
        return 'CON Payday\n1.Register/Update\n2.Check Limit\n3.Apply Loan\n4.My Loan\n5.Repay\n6.Help';
    }

    const main = parts[0];

    switch (main) {
        case '1': return handleRegister(parts, len, normalPhone);
        case '2': return handleLimit(parts, len, normalPhone);
        case '3': return handleApply(parts, len, normalPhone);
        case '4': return handleMyLoan(parts, len, normalPhone);
        case '5': return handleRepay(parts, len, normalPhone);
        case '6': return handleHelp(parts, len);
        default: return 'END Invalid option.\nDial *384*55# again.';
    }
}

function handleRegister(parts, len, phone) {
    if (len === 1) return 'CON Enter National ID:\n0.Back';

    const id = parts[1];
    if (id === '0') return 'END Back. Dial *384*55# again.';

    if (len === 2) {
        if (!/^\d{6,10}$/.test(id)) return 'CON Invalid ID. Enter National ID:\n0.Back';
        return 'CON Enter DOB (DDMMYYYY):\n0.Back';
    }

    const dob = parts[2];
    if (len === 3) {
        if (dob === '0') return 'END Back. Dial *384*55# again.';
        if (!/^\d{8}$/.test(dob)) return 'CON Invalid DOB. Use DDMMYYYY:\n0.Back';
        return 'CON Select Employer\n1.KCB\n2.Safaricom\n3.Sacco/Union\n4.Other\n0.Back';
    }

    const empChoice = parts[3];
    const isOther = empChoice === '4';

    if (len === 4) {
        if (empChoice === '0') return 'END Back. Dial *384*55# again.';
        if (['1', '2', '3'].includes(empChoice)) return 'CON Enter Staff/Payroll No:\n0.Back';
        if (isOther) return 'CON Type Employer Name:\n0.Back';
        return 'CON Invalid option.\n1.KCB\n2.Safaricom\n3.Sacco/Union\n4.Other\n0.Back';
    }

    // Standard path: 1*ID*DOB*EMP*STAFF*SALARY*PIN1*PIN2*CONSENT
    // Other path:    1*ID*DOB*4*NAME*STAFF*SALARY*PIN1*PIN2*CONSENT
    const staffIdx = isOther ? 5 : 4;
    const salaryIdx = isOther ? 6 : 5;
    const pin1Idx = isOther ? 7 : 6;
    const pin2Idx = isOther ? 8 : 7;
    const consentIdx = isOther ? 9 : 8;
    const submitLen = isOther ? 10 : 9;

    if (isOther && len === 5) {
        const empName = parts[4];
        if (empName === '0') return 'END Back. Dial *384*55# again.';
        if (empName.length < 2) return 'CON Enter Employer Name (min 2 chars):\n0.Back';
        return 'CON Enter Staff/Payroll No:\n0.Back';
    }

    if (len === staffIdx + 1) {
        const staffNo = parts[staffIdx];
        if (staffNo === '0') return 'END Back. Dial *384*55# again.';
        if (!staffNo || staffNo.length > 20) return 'CON Invalid Staff No.\nEnter Staff/Payroll No:\n0.Back';
        return 'CON Enter Net Salary (KES):\n0.Back';
    }

    if (len === salaryIdx + 1) {
        const salary = parts[salaryIdx];
        if (salary === '0') return 'END Back. Dial *384*55# again.';
        if (!/^\d+$/.test(salary) || Number(salary) < 1000) return 'CON Invalid amount.\nEnter Net Salary (KES):\n0.Back';
        return 'CON Set 4-digit PIN:\n0.Back';
    }

    if (len === pin1Idx + 1) {
        const pin1 = parts[pin1Idx];
        if (pin1 === '0') return 'END Back. Dial *384*55# again.';
        if (!/^\d{4}$/.test(pin1)) return 'CON Invalid PIN.\nEnter 4-digit PIN:\n0.Back';
        return 'CON Confirm PIN:\n0.Back';
    }

    if (len === pin2Idx + 1) {
        const pin1 = parts[pin1Idx];
        const pin2 = parts[pin2Idx];
        if (pin1 !== pin2) return 'CON PIN mismatch.\nSet 4-digit PIN:\n0.Back';
        return 'CON Accept Terms & Deduction\nMandate?\n1.Yes\n2.No';
    }

    if (len === consentIdx + 1) {
        const consent = parts[consentIdx];
        if (consent === '2') return 'END Registration cancelled.\nDial *384*55# to try again.';
        if (consent === '1') {
            // Register user
            const existingUser = store.findOne('users', u => u.phone === phone);
            let userId;
            if (existingUser) {
                userId = existingUser.id;
            } else {
                const newUser = store.create('users', {
                    phone,
                    id_no_enc: parts[1],
                    dob: `${parts[2].slice(4)}-${parts[2].slice(2, 4)}-${parts[2].slice(0, 2)}`,
                    full_name: '',
                    pin_hash: parts[pin1Idx],
                    status: 'active',
                    pin_failed_attempts: 0
                });
                userId = newUser.id;
            }

            const empId = isOther ? null : EMPLOYER_MAP[empChoice];
            if (empId) {
                const existing = store.findOne('employment', e => e.user_id === userId && e.employer_id === empId);
                if (!existing) {
                    store.create('employment', {
                        user_id: userId,
                        employer_id: empId,
                        staff_no: parts[staffIdx],
                        net_salary: Number(parts[salaryIdx]),
                        verified: false
                    });
                }
            }

            return 'END Registration complete.\nDial *384*55# to check\nlimit/apply.';
        }
        return 'CON Accept Terms & Deduction\nMandate?\n1.Yes\n2.No';
    }

    return 'END Session ended.\nDial *384*55# to try again.';
}

function handleLimit(parts, len, phone) {
    const user = store.findOne('users', u => u.phone === phone);
    if (!user) return 'END Not registered.\nDial *384*55# and select 1\nto Register.';

    if (len === 1) {
        const elig = checkEligibility(user.id);
        if (!elig.eligible) return `END Not eligible yet.\n${elig.reasons[0] || 'Update employer details.'}`;
        return `CON Your limit is ${formatCurrency(elig.limit)}\n1.Apply Loan\n0.Back`;
    }

    if (len === 2) {
        if (parts[1] === '0') return 'END Back. Dial *384*55# again.';
        if (parts[1] === '1') return 'CON Select Amount\n1.2,000\n2.5,000\n3.10,000\n4.20,000\n5.Enter Amount\n0.Back';
    }

    return 'END Session ended.\nDial *384*55# to try again.';
}

function handleApply(parts, len, phone) {
    const user = store.findOne('users', u => u.phone === phone);
    if (!user) return 'END Not registered.\nDial *384*55# and select 1\nto Register.';

    const openLoan = store.findOne('loans', l => l.user_id === user.id && ['pending_acceptance', 'active', 'overdue'].includes(l.status));
    if (openLoan) return 'END You have an existing loan.\nSelect 4 to view My Loan.';

    if (len === 1) return 'CON Select Amount\n1.2,000\n2.5,000\n3.10,000\n4.20,000\n5.Enter Amount\n0.Back';

    const amtChoice = parts[1];
    if (amtChoice === '0') return 'END Back. Dial *384*55# again.';

    const isCustom = amtChoice === '5';

    if (len === 2) {
        if (isCustom) return 'CON Enter Amount (KES):\n0.Back';
        if (AMOUNT_MAP[amtChoice]) return 'CON Select Term\n1.7 days\n2.14 days\n3.30 days\n4.Next Payroll\n0.Back';
        return 'CON Invalid option.\n1.2,000\n2.5,000\n3.10,000\n4.20,000\n5.Enter Amount\n0.Back';
    }

    // Resolve amount
    let amount, tenorPartIdx;
    if (isCustom) {
        if (len === 3) {
            const customAmt = parts[2];
            if (!/^\d+$/.test(customAmt) || Number(customAmt) < 2000) return 'CON Invalid amount.\nEnter Amount (KES):\n0.Back';
            return 'CON Select Term\n1.7 days\n2.14 days\n3.30 days\n4.Next Payroll\n0.Back';
        }
        amount = Number(parts[2]);
        tenorPartIdx = 3;
    } else {
        amount = AMOUNT_MAP[amtChoice];
        tenorPartIdx = 2;
    }

    // Tenor
    const tenorLen = tenorPartIdx + 1;
    if (len === tenorLen) {
        const tenorChoice = parts[tenorPartIdx];
        if (tenorChoice === '0') return 'END Back. Dial *384*55# again.';
        if (!TENOR_MAP[tenorChoice]) return 'CON Invalid option.\n1.7 days\n2.14 days\n3.30 days\n4.Next Payroll\n0.Back';
        return 'CON Disburse to\n1.M-Pesa this number\n2.Other M-Pesa number\n0.Back';
    }

    const tenorDays = TENOR_MAP[parts[tenorPartIdx]] || 30;
    const disbPartIdx = tenorPartIdx + 1;

    // Disbursement
    if (len === disbPartIdx + 1) {
        const disbChoice = parts[disbPartIdx];
        if (disbChoice === '0') return 'END Back. Dial *384*55# again.';
        if (disbChoice === '2') return 'CON Enter M-Pesa No\n(07XXXXXXXX):\n0.Back';
        if (disbChoice === '1') {
            // Show offer
            const elig = checkEligibility(user.id);
            if (!elig.eligible || amount > elig.limit) return `END Limit exceeded.\nMax: ${formatCurrency(elig.limit || 0)}`;
            const offer = calculateOffer(amount, tenorDays);
            return `CON Loan ${formatCurrency(offer.principal)}\nFee ${formatCurrency(offer.fee)}\nTotal ${formatCurrency(offer.totalDue)}\nDue ${offer.dueDate}\n1.Accept\n2.Decline\n0.Back`;
        }
        return 'CON Invalid option.\n1.M-Pesa this number\n2.Other M-Pesa number\n0.Back';
    }

    // If other phone
    const disbChoice = parts[disbPartIdx];
    if (disbChoice === '2' && len === disbPartIdx + 2) {
        const otherPhone = parts[disbPartIdx + 1];
        if (!/^0\d{9}$/.test(otherPhone) && !/^254\d{9}$/.test(otherPhone)) return 'CON Invalid phone.\nEnter M-Pesa No (07XXXXXXXX):\n0.Back';
        const elig = checkEligibility(user.id);
        if (!elig.eligible || amount > elig.limit) return `END Limit exceeded.\nMax: ${formatCurrency(elig.limit || 0)}`;
        const offer = calculateOffer(amount, tenorDays);
        return `CON Loan ${formatCurrency(offer.principal)}\nFee ${formatCurrency(offer.fee)}\nTotal ${formatCurrency(offer.totalDue)}\nDue ${offer.dueDate}\n1.Accept\n2.Decline\n0.Back`;
    }

    // Decision after offer (Accept/Decline)
    const offerLen = disbChoice === '2' ? disbPartIdx + 3 : disbPartIdx + 2;
    if (len === offerLen) {
        const decisionIdx = offerLen - 1;
        const decision = parts[decisionIdx];
        if (decision === '2') return 'END Application cancelled.';
        if (decision === '0') return 'END Back. Dial *384*55# again.';
        if (decision === '1') return 'CON Enter your 4-digit PIN:\n0.Back';
        return `CON Invalid option.\n1.Accept\n2.Decline\n0.Back`;
    }

    // PIN and create loan
    if (len === offerLen + 1) {
        const pin = parts[offerLen];
        if (pin === '0') return 'END Back. Dial *384*55# again.';
        if (!/^\d{4}$/.test(pin)) return 'CON Invalid PIN.\nEnter your 4-digit PIN:\n0.Back';

        // Create loan
        const employment = store.findOne('employment', e => e.user_id === user.id);
        const product = store.findOne('loan_products', p => p.tenor_days === tenorDays && p.active);
        const offer = calculateOffer(amount, tenorDays, product?.fee_rate);

        const disbPhone = disbChoice === '2' ? normalizePhone(parts[disbPartIdx + 1]) : phone;

        const loan = store.create('loans', {
            user_id: user.id,
            employer_id: employment?.employer_id || '',
            product_id: product?.id || 'prod-30',
            principal: offer.principal,
            fee: offer.fee,
            total_due: offer.totalDue,
            amount_paid: 0,
            balance: offer.totalDue,
            due_date: offer.dueDate,
            status: 'active',
            disbursement_phone: disbPhone,
            created_channel: 'ussd'
        });

        return 'END Approved. Disbursement\nprocessing. You will\nreceive SMS.';
    }

    return 'END Session ended.\nDial *384*55# to try again.';
}

function handleMyLoan(parts, len, phone) {
    const user = store.findOne('users', u => u.phone === phone);
    if (!user) return 'END Not registered.\nDial *384*55# and select 1\nto Register.';

    const loan = store.findOne('loans', l => l.user_id === user.id && ['pending_acceptance', 'active', 'overdue'].includes(l.status));
    if (!loan) return 'END No active loan.\nDial *384*55# and select 3\nto Apply.';

    if (len === 1) {
        return `CON Status: ${loan.status.toUpperCase()}\nBalance ${formatCurrency(loan.balance)}\nDue ${loan.due_date}\n1.Statement\n2.Repay\n0.Back`;
    }

    if (len === 2) {
        if (parts[1] === '0') return 'END Back. Dial *384*55# again.';
        if (parts[1] === '1') {
            const reps = store.find('repayments', r => r.loan_id === loan.id).slice(-3);
            if (reps.length === 0) return 'END No payments yet.\n0.Back';
            let msg = 'CON Last payments:\n';
            reps.forEach((r, i) => {
                msg += `${i + 1}) ${r.paid_at?.split('T')[0]} ${formatCurrency(r.amount)}\n`;
            });
            msg += '0.Back';
            return msg;
        }
        if (parts[1] === '2') return 'CON Repay\n1.STK Push\n2.Paybill\n0.Back';
    }

    return 'END Session ended.\nDial *384*55# to try again.';
}

function handleRepay(parts, len, phone) {
    const user = store.findOne('users', u => u.phone === phone);
    if (!user) return 'END Not registered.\nDial *384*55# and select 1\nto Register.';

    const loan = store.findOne('loans', l => l.user_id === user.id && ['active', 'overdue'].includes(l.status));
    if (!loan) return 'END No active loan to repay.';

    if (len === 1) return 'CON Repay\n1.STK Push\n2.Paybill\n0.Back';

    if (len === 2) {
        if (parts[1] === '0') return 'END Back. Dial *384*55# again.';
        if (parts[1] === '1') return 'CON Enter amount (KES):\n0.Back';
        if (parts[1] === '2') return `END Paybill: 123456\nAccount: ${phone}`;
        return 'CON Invalid option.\n1.STK Push\n2.Paybill\n0.Back';
    }

    if (len === 3 && parts[1] === '1') {
        const amt = parts[2];
        if (!/^\d+$/.test(amt) || Number(amt) <= 0) return 'CON Invalid amount.\nEnter amount (KES):\n0.Back';
        if (Number(amt) > loan.balance) return `CON Amount exceeds balance\n${formatCurrency(loan.balance)}.\nEnter amount (KES):\n0.Back`;
        return `CON Confirm STK Push\n${formatCurrency(Number(amt))}?\n1.Yes\n2.No\n0.Back`;
    }

    if (len === 4 && parts[1] === '1') {
        const confirm = parts[3];
        if (confirm === '0') return 'END Back. Dial *384*55# again.';
        if (confirm === '2') return 'END Cancelled.';
        if (confirm === '1') {
            const amt = Number(parts[2]);
            // Simulate payment
            store.create('repayments', {
                loan_id: loan.id,
                amount: amt,
                method: 'stk',
                reference: 'STK-USSD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
                paid_at: new Date().toISOString()
            });

            const newPaid = (Number(loan.amount_paid) || 0) + amt;
            const newBalance = Math.max(0, loan.total_due - newPaid);
            store.update('loans', loan.id, {
                amount_paid: newPaid,
                balance: newBalance,
                status: newBalance <= 0 ? 'paid' : loan.status
            });

            return 'END STK sent. Enter M-Pesa\nPIN to complete.';
        }
        return 'CON Invalid option.\n1.Yes\n2.No\n0.Back';
    }

    return 'END Session ended.\nDial *384*55# to try again.';
}

function handleHelp(parts, len) {
    if (len === 1) return 'CON Help\n1.FAQ\n2.Contact Agent\n3.Terms\n0.Back';
    if (len === 2) {
        switch (parts[1]) {
            case '0': return 'END Back. Dial *384*55# again.';
            case '1': return 'END FAQ: Dial *384*55#\n1 Register, 2 Limit,\n3 Apply, 5 Repay.';
            case '2': return 'END Call/WhatsApp:\n0700 000 000';
            case '3': return 'END Terms: Fees shown before\nacceptance. Late fees may\napply.';
            default: return 'CON Invalid option.\n1.FAQ\n2.Contact Agent\n3.Terms\n0.Back';
        }
    }
    return 'END Session ended.\nDial *384*55# to try again.';
}
