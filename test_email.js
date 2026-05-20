require('dotenv').config();
const { sendWelcomeEmail } = require('./services/emailService');

async function test() {
    try {
        await sendWelcomeEmail('chainandstrap@gmail.com', 'Admin');
        console.log('Test email sent successfully');
    } catch (e) {
        console.error('Error sending test email:', e);
    }
}
test();
