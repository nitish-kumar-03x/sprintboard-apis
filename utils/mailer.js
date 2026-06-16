const nodemailer = require('nodemailer');

const sendLoginNotification = async (email, name) => {
  try {
    console.log(`[DEBUG] Starting email job for: ${email}`);
    const isRender = process.env.RENDER;
    console.log(`[DEBUG] isRender env flag: ${isRender || 'undefined'}`);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      ...(isRender ? {} : { family: 4 }),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    console.log(`[DEBUG] Transporter configured. Verifying connection to SMTP...`);
    await transporter.verify();
    console.log(`[DEBUG] SMTP connection verified successfully.`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Security Alert: New Login to Your Account',
      text: `Hello ${name},\n\nWe detected a new login to your account. If this was you, you can safely ignore this email.\n\nIf you did not log in, please contact support immediately.\n\nBest,\nThe Sprintboard Team`,
      html: `<p>Hello ${name},</p><p>We detected a new login to your account. If this was you, you can safely ignore this email.</p><p>If you did not log in, please contact support immediately.</p><p>Best,<br>The Sprintboard Team</p>`,
    };

    console.log(`[DEBUG] Attempting to send mail...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[DEBUG] Email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('[ERROR] Failed to send email.');
    console.error('[ERROR] Error name:', error.name);
    console.error('[ERROR] Error message:', error.message);
    console.error('[ERROR] Error code:', error.code);
    console.error('[ERROR] Error command:', error.command);
    console.error('[ERROR] Full error stack:', error.stack);
  }
};

module.exports = { sendLoginNotification };
