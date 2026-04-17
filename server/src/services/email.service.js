const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

/**
 * Get or create the Nodemailer transporter.
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return transporter;
};

/**
 * Send a reminder email.
 */
const sendReminderEmail = async ({ to, documentTitle, expiryDate, daysLeft }) => {
  try {
    const transport = getTransporter();

    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject =
      daysLeft <= 1
        ? `⚠️ URGENT: "${documentTitle}" expires tomorrow!`
        : `📋 Reminder: "${documentTitle}" expires in ${daysLeft} days`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background: #f7f9fb; padding: 40px 0; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #000000, #00164e); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; font-family: 'Manrope', sans-serif; font-size: 24px; margin: 0; font-weight: 600; }
          .body { padding: 32px; }
          .badge { display: inline-block; background: ${daysLeft <= 1 ? '#ffdad6' : daysLeft <= 7 ? '#fff3cd' : '#dce1ff'}; color: ${daysLeft <= 1 ? '#93000a' : daysLeft <= 7 ? '#856404' : '#264191'}; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .doc-name { font-size: 20px; font-weight: 600; color: #191c1e; margin: 16px 0 8px; }
          .date { color: #76777d; font-size: 14px; }
          .cta { display: inline-block; background: #000000; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
          .footer { padding: 24px 32px; background: #f2f4f6; text-align: center; color: #76777d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LifeEase</h1>
          </div>
          <div class="body">
            <span class="badge">${daysLeft <= 1 ? 'EXPIRES TOMORROW' : `${daysLeft} DAYS LEFT`}</span>
            <p class="doc-name">${documentTitle}</p>
            <p class="date">Expires on ${formattedDate}</p>
            <p style="color: #45464d; font-size: 14px; line-height: 1.6;">
              This is a reminder that your document is approaching its expiration date.
              Please review and take necessary action to renew or update it.
            </p>
            <a href="${env.clientUrl}/documents" class="cta">View in Vault →</a>
          </div>
          <div class="footer">
            <p>You're receiving this because you have email reminders enabled on LifeEase.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transport.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
    });

    console.log(`✓ Reminder email sent to ${to} for "${documentTitle}"`);
    return true;
  } catch (error) {
    console.error(`✗ Email send error: ${error.message}`);
    return false;
  }
};

/**
 * Send a verification OTP email after registration.
 */
const sendVerificationEmail = async ({ to, name, code }) => {
  try {
    const transport = getTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background: #f4f6f9; padding: 40px 0; margin: 0; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: #1a1a2e; padding: 28px 32px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: -0.01em; }
          .body { padding: 36px 32px; }
          .greeting { font-size: 15px; color: #4b5563; margin: 0 0 8px; }
          .headline { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 24px; }
          .otp-box { background: #f1f3f6; border-radius: 10px; padding: 24px; text-align: center; margin: 0 0 24px; }
          .otp-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9ca3af; margin: 0 0 10px; }
          .otp-code { font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #1a1a2e; margin: 0; font-variant-numeric: tabular-nums; }
          .otp-expiry { font-size: 12px; color: #9ca3af; margin: 12px 0 0; }
          .info { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
          .warning { font-size: 12px; color: #9ca3af; margin: 20px 0 0; padding: 12px; background: #f9fafb; border-radius: 6px; }
          .footer { padding: 20px 32px; background: #f4f6f9; text-align: center; }
          .footer p { font-size: 11px; color: #9ca3af; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LifeEase</h1>
          </div>
          <div class="body">
            <p class="greeting">Hello ${name},</p>
            <p class="headline">Verify your email address</p>
            <div class="otp-box">
              <p class="otp-label">Your verification code</p>
              <p class="otp-code">${code}</p>
              <p class="otp-expiry">Expires in 10 minutes</p>
            </div>
            <p class="info">
              Enter this code on the verification page to activate your LifeEase account.
              Do not share this code with anyone.
            </p>
            <p class="warning">
              If you did not create a LifeEase account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LifeEase &mdash; Document Locker &amp; Renewal Reminder Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transport.sendMail({
      from: env.smtp.from,
      to,
      subject: `${code} is your LifeEase verification code`,
      html,
    });

    console.log(`\u2713 Verification email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`\u2717 Verification email error: ${error.message}`);
    return false;
  }
};

module.exports = { sendReminderEmail, sendVerificationEmail };
