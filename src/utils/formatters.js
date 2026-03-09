// Payday — Formatters (Currency, Date, Phone)

export function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return 'KES ' + num.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatCurrencyShort(amount) {
    const num = Number(amount) || 0;
    if (num >= 1000000) return 'KES ' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return 'KES ' + (num / 1000).toFixed(0) + 'K';
    return 'KES ' + num;
}

export function formatPhone(phone) {
    if (!phone) return '';
    const p = phone.replace(/\D/g, '');
    if (p.startsWith('254') && p.length === 12) {
        return '0' + p.slice(3, 6) + ' ' + p.slice(6, 9) + ' ' + p.slice(9);
    }
    if (p.startsWith('0') && p.length === 10) {
        return p.slice(0, 4) + ' ' + p.slice(4, 7) + ' ' + p.slice(7);
    }
    return phone;
}

export function normalizePhone(phone) {
    if (!phone) return '';
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0') && p.length === 10) p = '254' + p.slice(1);
    if (p.startsWith('+')) p = p.slice(1);
    return p;
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDateShort(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function daysUntil(dateStr) {
    if (!dateStr) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export function today() {
    return new Date().toISOString().split('T')[0];
}

export function formatPercent(value) {
    return (Number(value) * 100).toFixed(0) + '%';
}

export function formatIdMasked(idNo) {
    if (!idNo) return '****';
    const str = String(idNo);
    if (str.length <= 4) return '****';
    return '****' + str.slice(-4);
}

export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function statusLabel(status) {
    const labels = {
        pending_acceptance: 'Pending',
        active: 'Active',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
        failed_disbursement: 'Failed',
        due: 'Due',
        part_paid: 'Partial',
    };
    return labels[status] || capitalize(status);
}

export function statusBadgeClass(status) {
    const map = {
        pending_acceptance: 'badge-pending',
        active: 'badge-info',
        paid: 'badge-success',
        overdue: 'badge-danger',
        cancelled: 'badge-warning',
        failed_disbursement: 'badge-danger',
        due: 'badge-info',
        part_paid: 'badge-warning',
    };
    return map[status] || 'badge-info';
}
