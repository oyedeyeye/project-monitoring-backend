import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'admin@ppmiu.ondo.gov.ng' }, password: { type: 'string', example: 'SecurePassword123!' } } } })
    @ApiResponse({ status: 200, description: 'Successfully authenticated, returns JWT token', schema: { type: 'object', properties: { access_token: { type: 'string' }, user: { type: 'object' } } } })
    @ApiResponse({ status: 401, description: 'Invalid email or password' })
    async login(@Body() signInDto: Record<string, any>) {
        const user = await this.authService.validateUser(signInDto.email, signInDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.authService.login(user);
    }

    // Administrative user provisioning — NOT public self-registration.
    // Guarded at handler level so login/forgot-password/reset-password stay open.
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WEBMASTER_ADMIN)
    @ApiBearerAuth()
    @Post('register')
    @ApiOperation({ summary: 'Create a new user (Webmaster Admin only)' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'User successfully created and setup email sent' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden / Invalid Role' })
    @ApiResponse({ status: 409, description: 'User with this email already exists' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset email' })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'If email exists, reset link sent' })
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token' })
    @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string' }, newPassword: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    async resetPassword(@Body() body: { token: string; newPassword: string }) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
}
