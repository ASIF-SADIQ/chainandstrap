const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateOtp, sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'chainstraps_secret_2024';

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// ─────────────────────────────────────────────
// POST /api/auth/register
// Creates unverified user + sends OTP
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

        const existing = await User.findOne({ email });
        if (existing && existing.isVerified)
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (existing && !existing.isVerified) {
            // Resend OTP to existing unverified account
            existing.name = name;
            existing.password = password; // will be re-hashed by pre-save
            existing.otp = hashedOtp;
            existing.otpExpiry = otpExpiry;
            await existing.save();
        } else {
            await User.create({ name, email, password, phone, otp: hashedOtp, otpExpiry, isVerified: false });
        }

        let emailSent = true;
        try {
            await sendVerificationEmail(email, name, otp);
        } catch (emailErr) {
            console.error('⚠️  Email failed:', emailErr.message);
            emailSent = false;
        }

        res.status(201).json({
            success: true,
            message: emailSent
                ? 'OTP sent to your email. Please verify to complete registration.'
                : 'Account created! Email could not be sent — use this OTP to verify:',
            email,
            ...(emailSent ? {} : { otp }) // Only expose OTP if email failed
        });
    } catch (error) {
        console.error('❌ Register error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/verify-email
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({ success: false, message: 'User not found.' });
        if (user.isVerified)
            return res.status(400).json({ success: false, message: 'Email already verified.' });
        if (!user.otp || !user.otpExpiry)
            return res.status(400).json({ success: false, message: 'No OTP found. Please register again.' });
        if (new Date() > user.otpExpiry)
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

        const isMatch = await user.compareOtp(otp);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Send welcome email (non-blocking)
        sendWelcomeEmail(user.email, user.name).catch(() => {});

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! Welcome to Chain & Straps.',
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.isVerified)
            return res.status(400).json({ success: false, message: 'Account not found or already verified.' });

        const otp = generateOtp();
        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(email, user.name, otp);
        res.status(200).json({ success: true, message: 'New OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required.' });

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        if (!user.isVerified)
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in.', needsVerification: true, email });

        res.status(200).json({
            success: true,
            message: 'Logged in successfully!',
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isVerified: true });
        if (!user)
            return res.status(404).json({ success: false, message: 'No verified account found with this email.' });

        const otp = generateOtp();
        user.resetOtp = await bcrypt.hash(otp, 10);
        user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendPasswordResetEmail(email, user.name, otp);
        res.status(200).json({ success: true, message: 'Password reset OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword)
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        if (newPassword.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

        const user = await User.findOne({ email, isVerified: true });
        if (!user || !user.resetOtp)
            return res.status(404).json({ success: false, message: 'Invalid request.' });
        if (new Date() > user.resetOtpExpiry)
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

        const isMatch = await user.compareResetOtp(otp);
        if (!isMatch)
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });

        user.password = newPassword; // will be hashed by pre-save
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/auth/me (protected)
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -resetOtp');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/admin/users (admin only)
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -otp -resetOtp').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
