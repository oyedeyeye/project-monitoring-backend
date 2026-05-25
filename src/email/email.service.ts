import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendPasswordSetupEmail(email: string, token: string): Promise<void> {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const setupLink = `${frontendUrl}/setup-password?token=${token}`;
        
        const mailOptions = {
            from: process.env.SMTP_FROM || '"PPMIU Admin" <admin@ppmiu.ondo.gov.ng>',
            to: email,
            subject: 'Welcome to PPMIU - Setup Your Password',
            text: `Welcome to the PPMIU Analytics Dashboard!\n\nPlease setup your password by clicking the link below:\n${setupLink}\n\nThis link will expire in 24 hours.`,
            html: `<p>Welcome to the PPMIU Analytics Dashboard!</p><p>Please setup your password by clicking the link below:</p><p><a href="${setupLink}">Setup Password</a></p><p>This link will expire in 24 hours.</p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password setup email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password setup email to ${email}`, error);
            throw new Error('Failed to send email');
        }
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: process.env.SMTP_FROM || '"PPMIU Admin" <admin@ppmiu.ondo.gov.ng>',
            to: email,
            subject: 'PPMIU - Password Reset Request',
            text: `You requested a password reset.\n\nPlease reset your password by clicking the link below:\n${resetLink}\n\nThis link will expire in 30 minutes.`,
            html: `<p>You requested a password reset.</p><p>Please reset your password by clicking the link below:</p><p><a href="${resetLink}">Reset Password</a></p><p>This link will expire in 30 minutes.</p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
            throw new Error('Failed to send email');
        }
    }

    async sendAccountCreatedEmail(email: string, password: string): Promise<void> {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        const mailOptions = {
            from: process.env.SMTP_FROM || '"PPMIU Admin" <admin@ppmiu.ondo.gov.ng>',
            to: email,
            subject: 'Welcome to PPMIU - Account Details',
            text: `Welcome to the PPMIU Analytics Dashboard!\n\nAn account has been created for you by an administrator.\n\nHere are your login credentials:\nEmail: ${email}\nPassword: ${password}\n\nYou can log in at:\n${frontendUrl}\n\nWe recommend that you change your password after logging in.`,
            html: `<p>Welcome to the PPMIU Analytics Dashboard!</p><p>An account has been created for you by an administrator.</p><p>Here are your login credentials:</p><p><strong>Email:</strong> ${email}<br/><strong>Password:</strong> ${password}</p><p>You can log in at: <a href="${frontendUrl}">${frontendUrl}</a></p><p>We recommend that you change your password after logging in.</p>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Account details email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send account details email to ${email}`, error);
            throw new Error('Failed to send email');
        }
    }
}
