import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

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

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, fullName: { type: 'string' }, role: { type: 'string', enum: ['WEBMASTER_ADMIN', 'PPIMU_ADMIN', 'MDA_OFFICER'] }, mdaId: { type: 'string', nullable: true } } } })
    @ApiResponse({ status: 201, description: 'User successfully created and setup email sent' })
    @ApiResponse({ status: 409, description: 'User with this email already exists' })
    async register(@Body() registerDto: Record<string, any>) {
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
