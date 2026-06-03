require('dotenv').config();
const { sendOrderConfirmationEmail } = require('./services/emailService');

async function test() {
    console.log("Testing order confirmation email directly to the admin email...");
    const email = 'chainandstrap@gmail.com'; // User's email to test
    const items = [
        { title: 'Test Product 1', quantity: 1, price: 100 },
        { title: 'Test Product 2', quantity: 2, price: 50 }
    ];
    const total = 200;
    const address = {
        firstName: 'Nas',
        lastName: 'Ahmed',
        address: '123 Main St',
        city: 'Lahore',
        zip: '54000',
        country: 'Pakistan'
    };

    try {
        await sendOrderConfirmationEmail(email, 'Nas Ahmed', '5f9b3b3b3b3b3b3b3b3b3b3b', items, total, address);
        console.log("Customer email sent successfully!");
    } catch (err) {
        console.error("Customer email failed:", err);
    }
}
test();
