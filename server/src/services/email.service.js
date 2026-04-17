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

module.exports = { sendReminderEmail };
