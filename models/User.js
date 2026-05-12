const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Email Verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },           // Hashed OTP
    otpExpiry: { type: Date, default: null },

    // Forgot Password
    resetOtp: { type: String, default: null },      // Hashed Reset OTP
    resetOtpExpiry: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Compare OTP (plain vs hashed)
userSchema.methods.compareOtp = async function (candidateOtp) {
    return bcrypt.compare(candidateOtp, this.otp);
};

userSchema.methods.compareResetOtp = async function (candidateOtp) {
    return bcrypt.compare(candidateOtp, this.resetOtp);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
