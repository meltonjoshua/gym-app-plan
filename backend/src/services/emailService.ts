import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: any;
}

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, Mailgun, AWS SES)
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development - use Mailtrap or similar
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

const emailTemplates = {
  welcome: (data: any) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to FitTracker Pro!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️ Welcome to FitTracker Pro!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>Welcome to the ultimate fitness tracking experience! We're excited to have you join our community of fitness enthusiasts.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <a href="${data.verifyURL}" class="button">Verify Email Address</a>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>Once verified, you'll have access to:</p>
            <ul>
              <li>📱 Comprehensive workout tracking</li>
              <li>📊 Advanced progress analytics</li>
              <li>🤝 Social features and challenges</li>
              <li>🤖 AI-powered recommendations</li>
              <li>👨‍💼 Access to certified trainers</li>
            </ul>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
            <p>© 2024 FitTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to FitTracker Pro!
      
      Hi ${data.name}!
      
      Welcome to the ultimate fitness tracking experience! We're excited to have you join our community.
      
      To get started, please verify your email address by visiting: ${data.verifyURL}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't create this account, please ignore this email.
      
      Need help? Contact us at ${data.supportEmail}
      
      © 2024 FitTracker Pro. All rights reserved.
    `
  }),

  passwordReset: (data: any) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - FitTracker Pro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>You requested a password reset for your FitTracker Pro account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetURL}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 10 minutes</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            <p>For security reasons, this password reset link is only valid for 10 minutes.</p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
            <p>© 2024 FitTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - FitTracker Pro
      
      Hi ${data.name}!
      
      You requested a password reset for your FitTracker Pro account.
      
      Reset your password by visiting: ${data.resetURL}
      
      IMPORTANT:
      - This link will expire in 10 minutes
      - If you didn't request this reset, please ignore this email
      - Never share this link with anyone
      
      Need help? Contact us at ${data.supportEmail}
      
      © 2024 FitTracker Pro. All rights reserved.
    `
  }),

  workoutReminder: (data: any) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Workout Reminder - FitTracker Pro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💪 Time to Sweat!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>Your scheduled workout is coming up: <strong>${data.workoutName}</strong></p>
            <p>Scheduled for: ${data.scheduledTime}</p>
            <p>Don't let your goals slip away! Every workout brings you closer to the best version of yourself.</p>
            <a href="${data.appURL}" class="button">Open FitTracker Pro</a>
            <p><em>"The only bad workout is the one you didn't do."</em></p>
          </div>
          <div class="footer">
            <p>© 2024 FitTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Time to Sweat! - FitTracker Pro
      
      Hi ${data.name}!
      
      Your scheduled workout is coming up: ${data.workoutName}
      Scheduled for: ${data.scheduledTime}
      
      Don't let your goals slip away! Every workout brings you closer to the best version of yourself.
      
      Open your app: ${data.appURL}
      
      "The only bad workout is the one you didn't do."
      
      © 2024 FitTracker Pro. All rights reserved.
    `
  })
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create transporter
    const transporter = createTransporter();

    // Get email template
    const template = emailTemplates[options.template as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { html, text } = template(options.data);

    // Define email options
    const mailOptions = {
      from: `FitTracker Pro <${process.env.FROM_EMAIL || 'noreply@fittrackerpro.com'}>`,
      to: options.email,
      subject: options.subject,
      text,
      html
    };

    // Send email
    await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully', {
      to: options.email,
      subject: options.subject,
      template: options.template
    });

  } catch (error) {
    logger.error('Failed to send email', {
      to: options.email,
      subject: options.subject,
      template: options.template,
      error: error
    });
    throw error;
  }
};

export const sendBulkEmail = async (recipients: string[], options: Omit<EmailOptions, 'email'>): Promise<void> => {
  const promises = recipients.map(email => 
    sendEmail({ ...options, email })
  );

  try {
    await Promise.allSettled(promises);
    logger.info('Bulk email sent', {
      recipientCount: recipients.length,
      subject: options.subject,
      template: options.template
    });
  } catch (error) {
    logger.error('Failed to send bulk email', {
      recipientCount: recipients.length,
      subject: options.subject,
      template: options.template,
      error
    });
    throw error;
  }
};