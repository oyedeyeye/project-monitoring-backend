import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.profile?.role, mdaId: user.profile?.mdaId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile
            }
        };
    }

    async register(data: any) {
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        let userCreateInput: Prisma.UserCreateInput;
        const hasPassword = data.password && data.password.trim() !== '';

        let rawSetupToken: string | null = null;
        if (hasPassword) {
            const passwordHash = await bcrypt.hash(data.password, 10);
            userCreateInput = {
                email: data.email,
                passwordHash: passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                profile: {
                    create: {
                        fullName: data.fullName,
                        mdaId: data.mdaId,
                        role: data.role || 'MDA_OFFICER'
                    }
                }
            };
        } else {
            // Generate a setup token (fallback for passwordless creation)
            rawSetupToken = crypto.randomBytes(32).toString('hex');
            const hashedSetupToken = crypto.createHash('sha256').update(rawSetupToken).digest('hex');
            const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            const placeholderHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

            userCreateInput = {
                email: data.email,
                passwordHash: placeholderHash,
                resetPasswordToken: hashedSetupToken,
                resetPasswordExpires: tokenExpires,
                profile: {
                    create: {
                        fullName: data.fullName,
                        mdaId: data.mdaId,
                        role: data.role || 'MDA_OFFICER'
                    }
                }
            };
        }

        const user = await this.usersService.create(userCreateInput);

        // Send the appropriate onboarding email
        if (hasPassword) {
            try {
                await this.emailService.sendAccountCreatedEmail(user.email, data.password);
            } catch (error) {
                console.error(`[AuthService] WARNING: Failed to send account details email to ${user.email} (SMTP connection/firewall issue).`);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                console.log(`\n👉 [DEVELOPMENT BACKUP CREDENTIALS] Email: ${user.email} | Password: ${data.password}\nLogin Link: ${frontendUrl}\n`);
            }
        } else if (rawSetupToken) {
            // Setup token flow
            try {
                await this.emailService.sendPasswordSetupEmail(user.email, rawSetupToken);
            } catch (error) {
                console.error(`[AuthService] WARNING: Failed to send password setup email to ${user.email} (SMTP connection/firewall issue).`);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                console.log(`\n👉 [DEVELOPMENT BACKUP LINK] Click here to setup password for ${user.email}:\n${frontendUrl}/setup-password?token=${rawSetupToken}\n`);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...result } = user;
        return result;
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        const genericMessage = { message: 'If the email is registered, a reset link will be sent.' };
        
        if (!user) {
            return genericMessage;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await this.usersService.update(user.id, {
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: tokenExpires,
        });

        this.emailService.sendPasswordResetEmail(user.email, resetToken).catch(error => {
            console.error(`[AuthService] WARNING: Failed to send password reset email to ${user.email} (SMTP connection/firewall issue).`);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            console.log(`\n👉 [DEVELOPMENT BACKUP LINK] Click here to reset password for ${user.email}:\n${frontendUrl}/reset-password?token=${resetToken}\n`);
        });

        return genericMessage;
    }

    async resetPassword(token: string, newPassword: string) {
        const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.usersService.findByResetToken(hashedResetToken);
        
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await this.usersService.update(user.id, {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return { message: 'Password has been successfully reset' };
    }
}
