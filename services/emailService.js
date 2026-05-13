const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    const { data, error } = await resend.emails.send({
        from: 'Chain & Straps <onboarding@resend.dev>',
        to,
        subject,
        html
    });
    if (error) throw new Error(error.message);
    return data;
};

console.log('✅ Email service ready (Resend API)');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Shared Layout Wrapper ───────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Chain & Straps</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #2a2a2a;border-radius:4px;overflow:hidden;max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 100%);padding:40px 48px;border-bottom:1px solid #c9a96e;text-align:center;">
            <p style="margin:0 0 4px 0;letter-spacing:0.6em;font-size:10px;color:#c9a96e;text-transform:uppercase;">Est. 2024</p>
            <h1 style="margin:0;font-family:'Georgia',serif;font-size:28px;font-weight:400;letter-spacing:0.5em;color:#ffffff;text-transform:uppercase;">Chain & Straps</h1>
            <p style="margin:8px 0 0 0;letter-spacing:0.35em;font-size:9px;color:#888888;text-transform:uppercase;">Luxury Redefined</p>
            <!-- Gold Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="height:1px;background:linear-gradient(to right,transparent,#c9a96e,transparent);"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:48px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d0d0d;padding:32px 48px;border-top:1px solid #1e1e1e;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:1px;background:linear-gradient(to right,transparent,#c9a96e40,transparent);margin-bottom:24px;"></td>
              </tr>
            </table>
            <p style="margin:20px 0 8px 0;font-family:'Georgia',serif;font-size:16px;letter-spacing:0.3em;color:#c9a96e;text-transform:uppercase;">Chain & Straps</p>
            <p style="margin:0 0 16px 0;font-size:11px;color:#555555;letter-spacing:0.1em;">The World's Finest Luxury Accessories</p>
            <!-- Social Links -->
            <p style="margin:0 0 16px 0;">
              <a href="https://pinterest.com/chainandstraps" style="color:#c9a96e;text-decoration:none;font-size:11px;letter-spacing:0.15em;margin:0 12px;">PINTEREST</a>
              <span style="color:#333;">|</span>
              <a href="https://chainandstraps.com" style="color:#c9a96e;text-decoration:none;font-size:11px;letter-spacing:0.15em;margin:0 12px;">SHOP NOW</a>
              <span style="color:#333;">|</span>
              <a href="https://chainandstraps.com/all" style="color:#c9a96e;text-decoration:none;font-size:11px;letter-spacing:0.15em;margin:0 12px;">COLLECTIONS</a>
            </p>
            <p style="margin:0;font-size:10px;color:#3a3a3a;letter-spacing:0.05em;">© ${new Date().getFullYear()} Chain &amp; Straps. All rights reserved.</p>
            <p style="margin:6px 0 0 0;font-size:10px;color:#2e2e2e;">You received this email because you created an account at chainandstraps.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── OTP Box Helper ──────────────────────────────────────
const otpBoxes = (otp) => otp.split('').map(d => `
  <td style="padding:0 4px;">
    <div style="width:44px;height:56px;background:#1a1a1a;border:1px solid #c9a96e;border-radius:4px;display:inline-block;text-align:center;line-height:56px;font-size:26px;font-weight:bold;color:#c9a96e;font-family:monospace;">${d}</div>
  </td>`).join('');

// ─── Template 1: Email Verification ─────────────────────
const verificationTemplate = (name, otp) => emailWrapper(`
  <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.3em;color:#c9a96e;text-transform:uppercase;">Hello, ${name}</p>
  <h2 style="margin:0 0 20px 0;font-family:'Georgia',serif;font-size:26px;font-weight:400;color:#ffffff;">Verify Your Email Address</h2>
  <p style="margin:0 0 28px 0;font-size:14px;line-height:1.8;color:#888888;">
    Welcome to <strong style="color:#c9a96e;">Chain &amp; Straps</strong> — your destination for the world's finest luxury accessories. 
    To complete your registration and unlock exclusive access to our curated collections, please verify your email with the code below.
  </p>

  <!-- OTP Display -->
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;background:#141414;border:1px solid #2a2a2a;border-radius:6px;padding:24px 32px;">
    <tr>
      <td align="center">
        <p style="margin:0 0 16px 0;font-size:10px;letter-spacing:0.3em;color:#666;text-transform:uppercase;">Your Verification Code</p>
        <table cellpadding="0" cellspacing="0"><tr>${otpBoxes(otp)}</tr></table>
        <p style="margin:16px 0 0 0;font-size:11px;color:#555555;">Expires in <strong style="color:#c9a96e;">10 minutes</strong></p>
      </td>
    </tr>
  </table>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
    <tr>
      <td style="background:#c9a96e;border-radius:2px;padding:0;">
        <a href="https://chainandstraps.com/verify-email" style="display:inline-block;padding:16px 40px;font-size:11px;font-weight:bold;letter-spacing:0.3em;color:#0d0d0d;text-decoration:none;text-transform:uppercase;">Verify My Account</a>
      </td>
    </tr>
  </table>

  <!-- Feature Highlight -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;padding-top:28px;margin-top:8px;">
    <tr>
      <td width="33%" style="text-align:center;padding:0 8px;">
        <p style="margin:0 0 6px 0;font-size:18px;">👜</p>
        <p style="margin:0;font-size:10px;color:#c9a96e;letter-spacing:0.2em;text-transform:uppercase;">160K+ Products</p>
        <p style="margin:4px 0 0 0;font-size:10px;color:#555;">Curated Luxury</p>
      </td>
      <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
        <p style="margin:0 0 6px 0;font-size:18px;">🔒</p>
        <p style="margin:0;font-size:10px;color:#c9a96e;letter-spacing:0.2em;text-transform:uppercase;">Secure & Encrypted</p>
        <p style="margin:4px 0 0 0;font-size:10px;color:#555;">SSL Protected</p>
      </td>
      <td width="33%" style="text-align:center;padding:0 8px;">
        <p style="margin:0 0 6px 0;font-size:18px;">🌍</p>
        <p style="margin:0;font-size:10px;color:#c9a96e;letter-spacing:0.2em;text-transform:uppercase;">Worldwide Delivery</p>
        <p style="margin:4px 0 0 0;font-size:10px;color:#555;">Fast & Insured</p>
      </td>
    </tr>
  </table>

  <p style="margin:28px 0 0 0;font-size:11px;color:#3d3d3d;text-align:center;">
    Didn't create an account? You can safely ignore this email.<br/>
    Never share your OTP with anyone — Chain &amp; Straps will never ask for it.
  </p>
`);

// ─── Template 2: Password Reset ──────────────────────────
const passwordResetTemplate = (name, otp) => emailWrapper(`
  <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.3em;color:#c9a96e;text-transform:uppercase;">Security Alert</p>
  <h2 style="margin:0 0 20px 0;font-family:'Georgia',serif;font-size:26px;font-weight:400;color:#ffffff;">Password Reset Request</h2>
  <p style="margin:0 0 28px 0;font-size:14px;line-height:1.8;color:#888888;">
    Hello <strong style="color:#ffffff;">${name}</strong>, we received a request to reset the password for your 
    <strong style="color:#c9a96e;">Chain &amp; Straps</strong> account. Use the one-time code below to proceed.
  </p>

  <!-- OTP Display -->
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;background:#0d0d0d;border:1px solid #c9a96e40;border-radius:6px;padding:24px 32px;">
    <tr>
      <td align="center">
        <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:0.3em;color:#666;text-transform:uppercase;">Password Reset Code</p>
        <table cellpadding="0" cellspacing="0" style="margin:12px 0;"><tr>${otpBoxes(otp)}</tr></table>
        <p style="margin:0;font-size:11px;color:#555555;">Valid for <strong style="color:#c9a96e;">10 minutes only</strong></p>
      </td>
    </tr>
  </table>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
    <tr>
      <td style="background:#c9a96e;border-radius:2px;">
        <a href="https://chainandstraps.com/reset-password" style="display:inline-block;padding:16px 40px;font-size:11px;font-weight:bold;letter-spacing:0.3em;color:#0d0d0d;text-decoration:none;text-transform:uppercase;">Reset My Password</a>
      </td>
    </tr>
  </table>

  <!-- Warning Box -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0000;border:1px solid #3d0000;border-radius:4px;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 4px 0;font-size:11px;color:#ff6b6b;letter-spacing:0.2em;text-transform:uppercase;font-weight:bold;">⚠ Security Notice</p>
        <p style="margin:0;font-size:12px;color:#883333;line-height:1.6;">
          If you didn't request a password reset, your account may be at risk. 
          <a href="https://chainandstraps.com/login" style="color:#c9a96e;">Secure your account immediately.</a>
        </p>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:11px;color:#3d3d3d;text-align:center;">
    For your security, this link expires in 10 minutes and can only be used once.<br/>
    Chain &amp; Straps Support — support@chainandstraps.com
  </p>
`);

// ─── Template 3: Welcome (Post-Verification) ─────────────
const welcomeTemplate = (name) => emailWrapper(`
  <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.3em;color:#c9a96e;text-transform:uppercase;">Welcome to the Family</p>
  <h2 style="margin:0 0 20px 0;font-family:'Georgia',serif;font-size:26px;font-weight:400;color:#ffffff;">Your Account is Verified ✓</h2>
  <p style="margin:0 0 28px 0;font-size:14px;line-height:1.8;color:#888888;">
    Hello <strong style="color:#ffffff;">${name}</strong>,<br/><br/>
    Welcome to <strong style="color:#c9a96e;">Chain &amp; Straps</strong>. Your account is now active and you have full access 
    to our exclusive collections of luxury bags, watches, shoes, and accessories from the world's finest maisons.
  </p>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 40px auto;">
    <tr>
      <td style="background:#c9a96e;border-radius:2px;margin-right:12px;">
        <a href="https://chainandstraps.com/all" style="display:inline-block;padding:16px 40px;font-size:11px;font-weight:bold;letter-spacing:0.3em;color:#0d0d0d;text-decoration:none;text-transform:uppercase;">Explore Collections</a>
      </td>
    </tr>
  </table>

  <!-- Collections Grid -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr>
      <td width="50%" style="padding:0 6px 12px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #222;border-radius:4px;overflow:hidden;">
          <tr><td style="padding:20px;text-align:center;">
            <p style="margin:0 0 6px 0;font-size:20px;">👜</p>
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.25em;color:#c9a96e;text-transform:uppercase;font-weight:bold;">Bags</p>
            <p style="margin:0;font-size:10px;color:#555;">Chanel · Dior · LV</p>
          </td></tr>
        </table>
      </td>
      <td width="50%" style="padding:0 0 12px 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #222;border-radius:4px;overflow:hidden;">
          <tr><td style="padding:20px;text-align:center;">
            <p style="margin:0 0 6px 0;font-size:20px;">⌚</p>
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.25em;color:#c9a96e;text-transform:uppercase;font-weight:bold;">Watches</p>
            <p style="margin:0;font-size:10px;color:#555;">Rolex · Cartier · AP</p>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td width="50%" style="padding:0 6px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #222;border-radius:4px;overflow:hidden;">
          <tr><td style="padding:20px;text-align:center;">
            <p style="margin:0 0 6px 0;font-size:20px;">👠</p>
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.25em;color:#c9a96e;text-transform:uppercase;font-weight:bold;">Shoes</p>
            <p style="margin:0;font-size:10px;color:#555;">Louboutin · Gucci</p>
          </td></tr>
        </table>
      </td>
      <td width="50%" style="padding:0 0 0 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #222;border-radius:4px;overflow:hidden;">
          <tr><td style="padding:20px;text-align:center;">
            <p style="margin:0 0 6px 0;font-size:20px;">💎</p>
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.25em;color:#c9a96e;text-transform:uppercase;font-weight:bold;">Accessories</p>
            <p style="margin:0;font-size:10px;color:#555;">Scarves · Wallets</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:12px;color:#555555;text-align:center;line-height:1.6;">
    Questions? We're here for you at <a href="mailto:support@chainandstraps.com" style="color:#c9a96e;text-decoration:none;">support@chainandstraps.com</a>
  </p>
`);

// ─── Exported Send Functions ─────────────────────────────
const sendVerificationEmail = async (toEmail, name, otp) => {
    await sendEmail({
        to: toEmail,
        subject: `${otp} is your Chain & Straps verification code`,
        html: verificationTemplate(name, otp)
    });
};

const sendPasswordResetEmail = async (toEmail, name, otp) => {
    await sendEmail({
        to: toEmail,
        subject: `Password Reset Code: ${otp} — Chain & Straps`,
        html: passwordResetTemplate(name, otp)
    });
};

const sendWelcomeEmail = async (toEmail, name) => {
    await sendEmail({
        to: toEmail,
        subject: `Welcome to Chain & Straps, ${name} ✓`,
        html: welcomeTemplate(name)
    });
};

module.exports = { generateOtp, sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail };
