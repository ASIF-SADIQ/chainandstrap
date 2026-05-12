const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Gmail App Password (not regular password)
    }
});

// Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send Verification OTP Email
const sendVerificationEmail = async (toEmail, name, otp) => {
    const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
        <div style="text-align: center; border-bottom: 1px solid #c9a96e; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="color: #c9a96e; letter-spacing: 0.4em; font-size: 24px; margin: 0;">CHAIN & STRAPS</h1>
            <p style="color: #888; font-size: 12px; letter-spacing: 0.2em; margin-top: 8px;">LUXURY REDEFINED</p>
        </div>
        <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 8px;">Verify Your Email</h2>
        <p style="color: #aaaaaa; line-height: 1.6;">Hello <strong style="color: #c9a96e">${name}</strong>,</p>
        <p style="color: #aaaaaa; line-height: 1.6;">Welcome to Chain & Straps. Please use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 36px 0;">
            <div style="display: inline-block; background: #c9a96e; color: #0a0a0a; font-size: 40px; font-weight: bold; letter-spacing: 0.3em; padding: 20px 40px; border-radius: 4px;">
                ${otp}
            </div>
        </div>
        <p style="color: #666; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <div style="border-top: 1px solid #222; margin-top: 40px; padding-top: 20px; text-align: center;">
            <p style="color: #444; font-size: 11px; letter-spacing: 0.1em;">© ${new Date().getFullYear()} CHAIN & STRAPS. ALL RIGHTS RESERVED.</p>
        </div>
    </div>`;

    await transporter.sendMail({
        from: `"Chain & Straps" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Verification Code — Chain & Straps',
        html
    });
};

// Send Password Reset OTP
const sendPasswordResetEmail = async (toEmail, name, otp) => {
    const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
        <div style="text-align: center; border-bottom: 1px solid #c9a96e; padding-bottom: 24px; margin-bottom: 32px;">
            <h1 style="color: #c9a96e; letter-spacing: 0.4em; font-size: 24px; margin: 0;">CHAIN & STRAPS</h1>
        </div>
        <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #aaaaaa; line-height: 1.6;">Hello <strong style="color: #c9a96e">${name}</strong>,</p>
        <p style="color: #aaaaaa; line-height: 1.6;">We received a request to reset your password. Use the code below:</p>
        <div style="text-align: center; margin: 36px 0;">
            <div style="display: inline-block; background: #1a1a1a; border: 2px solid #c9a96e; color: #c9a96e; font-size: 40px; font-weight: bold; letter-spacing: 0.3em; padding: 20px 40px; border-radius: 4px;">
                ${otp}
            </div>
        </div>
        <p style="color: #666; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        <div style="border-top: 1px solid #222; margin-top: 40px; padding-top: 20px; text-align: center;">
            <p style="color: #444; font-size: 11px; letter-spacing: 0.1em;">© ${new Date().getFullYear()} CHAIN & STRAPS. ALL RIGHTS RESERVED.</p>
        </div>
    </div>`;

    await transporter.sendMail({
        from: `"Chain & Straps" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Password Reset Code — Chain & Straps',
        html
    });
};

module.exports = { generateOtp, sendVerificationEmail, sendPasswordResetEmail };
