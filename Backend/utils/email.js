const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    return false;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name, email, password) => ({
    subject: 'Welcome to OSMS - Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to OSMS!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please change your password after your first login for security purposes.</p>
        <p>Best regards,<br>OSMS Team</p>
      </div>
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'OSMS - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You requested to reset your password. Click the button below to reset:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
        <p>Best regards,<br>OSMS Team</p>
      </div>
    `
  }),

  feeReminder: (name, amount, dueDate, schoolName) => ({
    subject: `Fee Payment Reminder - ${schoolName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Fee Payment Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder that your fee payment is due:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please make the payment before the due date to avoid late fees.</p>
        <p>Best regards,<br>${schoolName}</p>
      </div>
    `
  }),

  assignmentNotification: (studentName, assignmentTitle, dueDate, teacherName, subjectName) => ({
    subject: `New Assignment: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Assignment Posted</h2>
        <p>Dear ${studentName},</p>
        <p>A new assignment has been posted:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Title:</strong> ${assignmentTitle}</p>
          <p><strong>Subject:</strong> ${subjectName}</p>
          <p><strong>Teacher:</strong> ${teacherName}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please submit your assignment before the deadline.</p>
        <p>Best regards,<br>OSMS Team</p>
      </div>
    `
  }),

  resultPublished: (studentName, examName, className) => ({
    subject: `Results Published: ${examName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Exam Results Published</h2>
        <p>Dear ${studentName},</p>
        <p>The results for the following exam have been published:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Exam:</strong> ${examName}</p>
          <p><strong>Class:</strong> ${className}</p>
        </div>
        <p>Please login to your portal to view your results.</p>
        <p>Best regards,<br>OSMS Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
