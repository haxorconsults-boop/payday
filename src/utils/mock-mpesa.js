// Payday — M-Pesa Simulation (B2C Disbursement + STK Push)

function generateRef(prefix = 'MP') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = prefix;
    for (let i = 0; i < 10; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    return ref;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulate M-Pesa B2C disbursement (success rate: 95%)
export async function simulateDisburse(phone, amount) {
    await delay(1500 + Math.random() * 1000); // simulate network
    const success = Math.random() > 0.05; // 95% success
    return {
        success,
        status: success ? 'success' : 'failed',
        amount,
        phone,
        provider_ref: generateRef('B2C'),
        message: success
            ? `KES ${amount.toLocaleString()} sent to ${phone}. M-Pesa ref: ${generateRef('B2C')}`
            : 'Disbursement failed. Please retry.',
        timestamp: new Date().toISOString()
    };
}

// Simulate STK Push (with multi-step animation support)
export async function simulateSTKPush(phone, amount, onStep) {
    // Step 1: Initiating
    if (onStep) onStep('initiating', 'Sending STK Push to phone...');
    await delay(1200);

    // Step 2: PIN prompt
    if (onStep) onStep('pin_prompt', 'Enter M-Pesa PIN on your phone...');
    await delay(2500);

    // Step 3: Processing
    if (onStep) onStep('processing', 'Processing payment...');
    await delay(1500);

    // Step 4: Result
    const success = Math.random() > 0.08; // 92% success
    const ref = generateRef('STK');

    if (onStep) onStep(success ? 'success' : 'failed', success
        ? `Payment of KES ${amount.toLocaleString()} received. Ref: ${ref}`
        : 'Payment failed or cancelled by user.'
    );

    return {
        success,
        status: success ? 'success' : 'failed',
        amount,
        phone,
        reference: ref,
        checkout_request_id: 'ws_CO_' + generateRef(''),
        message: success
            ? `Payment of KES ${amount.toLocaleString()} received successfully.`
            : 'Payment failed or was cancelled.',
        timestamp: new Date().toISOString()
    };
}

// Simulate OTP send
export async function simulateOTP(phone) {
    await delay(800);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    // In simulation, we'll just return the OTP (in real life it would be sent via SMS)
    return {
        success: true,
        otp, // Shown via toast in simulation
        message: `OTP sent to ${phone}`,
    };
}

// Verify OTP (simulation: always valid if matches)
export function verifyOTP(inputOtp, actualOtp) {
    return inputOtp === actualOtp || inputOtp === '123456'; // 123456 always works in demo
}
