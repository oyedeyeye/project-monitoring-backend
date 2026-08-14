"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendPasswordSetupEmail(email, token) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send password setup email to ${email}`, error);
            throw new Error('Failed to send email');
        }
    }
    async sendPasswordResetEmail(email, token) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
            throw new Error('Failed to send email');
        }
    }
    async sendAccountCreatedEmail(email, password) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send account details email to ${email}`, error);
            throw new Error('Failed to send email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map