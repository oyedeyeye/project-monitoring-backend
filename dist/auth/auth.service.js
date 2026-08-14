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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    emailService;
    constructor(usersService, jwtService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
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
    async register(data) {
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        let userCreateInput;
        const hasPassword = data.password && data.password.trim() !== '';
        let rawSetupToken = null;
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
        }
        else {
            rawSetupToken = crypto.randomBytes(32).toString('hex');
            const hashedSetupToken = crypto.createHash('sha256').update(rawSetupToken).digest('hex');
            const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
        if (hasPassword) {
            try {
                await this.emailService.sendAccountCreatedEmail(user.email, data.password);
            }
            catch (error) {
                console.error(`[AuthService] WARNING: Failed to send account details email to ${user.email} (SMTP connection/firewall issue). The account was created; ask the user to use "Forgot password" to set their password.`);
            }
        }
        else if (rawSetupToken) {
            try {
                await this.emailService.sendPasswordSetupEmail(user.email, rawSetupToken);
            }
            catch (error) {
                console.error(`[AuthService] WARNING: Failed to send password setup email to ${user.email} (SMTP connection/firewall issue). The account was created; ask the user to use "Forgot password" to set their password.`);
            }
        }
        const { passwordHash: _passwordHash, resetPasswordToken: _resetPasswordToken, resetPasswordExpires: _resetPasswordExpires, ...result } = user;
        return result;
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        const genericMessage = { message: 'If the email is registered, a reset link will be sent.' };
        if (!user) {
            return genericMessage;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpires = new Date(Date.now() + 30 * 60 * 1000);
        await this.usersService.update(user.id, {
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: tokenExpires,
        });
        this.emailService.sendPasswordResetEmail(user.email, resetToken).catch(error => {
            console.error(`[AuthService] WARNING: Failed to send password reset email to ${user.email} (SMTP connection/firewall issue).`);
        });
        return genericMessage;
    }
    async resetPassword(token, newPassword) {
        const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.usersService.findByResetToken(hashedResetToken);
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, {
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });
        return { message: 'Password has been successfully reset' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map