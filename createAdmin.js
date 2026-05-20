const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'chainandstrap@gmail.com';
        const password = 'Admin@1234';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user to admin
            user.role = 'admin';
            user.isVerified = true;
            user.password = password; // pre-save hook will hash it
            await user.save();
            console.log(`✅ User ${email} has been UPDATED to Admin.`);
        } else {
            // Create new admin user
            await User.create({
                name: 'Admin',
                email: email,
                password: password,
                role: 'admin',
                isVerified: true
            });
            console.log(`✅ New Admin account CREATED: ${email}`);
        }

        console.log('\n--- LOGIN DETAILS ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('----------------------\n');

        process.exit();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

createAdmin();
