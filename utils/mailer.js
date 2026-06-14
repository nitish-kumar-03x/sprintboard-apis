const nodemailer = require('nodemailer');

const sendLoginNotification = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Security Alert: New Login to Your Account',
      text: `Hello ${name},\n\nWe detected a new login to your account. If this was you, you can safely ignore this email.\n\nIf you did not log in, please contact support immediately.\n\nBest,\nThe Sprintboard Team`,
      html: `<p>Hello ${name},</p><p>We detected a new login to your account. If this was you, you can safely ignore this email.</p><p>If you did not log in, please contact support immediately.</p><p>Best,<br>The Sprintboard Team</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Login notification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = { sendLoginNotification };
