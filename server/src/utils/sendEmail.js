const nodemailer = require('nodemailer');

/**
 * Send an email with Voyanta branded HTML template
 * Supports Gmail, custom SMTP, or automatic test transport fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  let transporter;

  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (hasCredentials) {
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Standard Gmail configuration
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  } else {
    // If no credentials configured yet, generate an automated Ethereal test mailbox
    console.warn('⚠️ EMAIL_USER & EMAIL_PASS not set in server/.env. Using Ethereal test email service.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Voyanta Travel'}" <${process.env.EMAIL_USER || 'no-reply@voyanta.com'}>`,
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);

  if (!hasCredentials) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`📧 Test Email Sent! View in web inbox here: ${previewUrl}`);
    return { info, previewUrl };
  }

  console.log(`📧 Email delivered to: ${to} (Message ID: ${info.messageId})`);
  return { info };
};

module.exports = sendEmail;
