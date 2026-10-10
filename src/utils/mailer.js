const nodemailer = require("nodemailer");
const { Queue, Worker } = require("bullmq");

const IORedis = require("ioredis");
const redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    try {
      const { to, subject, text, html } = job.data;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      };
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email via BullMQ:", error.message);
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

emailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job.id} failed with error: ${err.message}`);
});

const sendEmailQueue = async (options) => {
  await emailQueue.add("send-email", options);
};

const sendLoginNotification = async (email, name) => {
  await sendEmailQueue({
    to: email,
    subject: "Security Alert: New Login to Your Account",
    text: `Hello ${name},\n\nWe detected a new login to your account. If this was you, you can safely ignore this email.\n\nIf you did not log in, please contact support immediately.\n\nBest,\nThe Sprintboard Team`,
    html: `<p>Hello ${name},</p><p>We detected a new login to your account. If this was you, you can safely ignore this email.</p><p>If you did not log in, please contact support immediately.</p><p>Best,<br>The Sprintboard Team</p>`,
  });
};


const sendOTPEmail = async (email, name, otp) => {
  await sendEmailQueue({
    to: email,
    subject: "Your Password Reset OTP",
    text: `Hello ${name},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nBest,\nThe Sprintboard Team`,
    html: `<p>Hello ${name},</p><p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes.</p><p>Best,<br>The Sprintboard Team</p>`,
  });
};

module.exports = {
  sendLoginNotification,
  sendOTPEmail,
  emailQueue
};
