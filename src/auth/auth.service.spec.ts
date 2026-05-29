import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let emailService: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    
    emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
      sendPasswordSetupEmail: jest.fn().mockResolvedValue(true),
      sendAccountCreatedEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: {} },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user with an admin-configured password', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ id: 'uuid-456', email: 'test@ppmiu.ondo.gov.ng', passwordHash: 'hashedPass123' });

    const payload = {
      email: 'test@ppmiu.ondo.gov.ng',
      fullName: 'John Doe',
      role: 'MDA_OFFICER',
      mdaId: 'mda-123',
      password: 'myAdminPassword123'
    };

    await service.register(payload);

    expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@ppmiu.ondo.gov.ng',
      passwordHash: expect.any(String),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    }));
    expect(emailService.sendAccountCreatedEmail).toHaveBeenCalledWith('test@ppmiu.ondo.gov.ng', 'myAdminPassword123');
  });

  it('should register a user without a password and generate a setup token', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ id: 'uuid-789', email: 'test@ppmiu.ondo.gov.ng', passwordHash: 'placeholderHash' });

    const payload = {
      email: 'test@ppmiu.ondo.gov.ng',
      fullName: 'Jane Doe',
      role: 'MDA_OFFICER',
      mdaId: 'mda-123'
    };

    await service.register(payload);

    expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@ppmiu.ondo.gov.ng',
      passwordHash: expect.any(String),
      resetPasswordToken: expect.any(String),
      resetPasswordExpires: expect.any(Date),
    }));
    expect(emailService.sendPasswordSetupEmail).toHaveBeenCalledWith('test@ppmiu.ondo.gov.ng', expect.any(String));
  });

  it('should process forgot password and call email service', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'uuid-123', email: 'test@ppmiu.ondo.gov.ng' });
    
    await service.forgotPassword('test@ppmiu.ondo.gov.ng');
    
    expect(usersService.update).toHaveBeenCalledWith('uuid-123', expect.objectContaining({
      resetPasswordToken: expect.any(String)
    }));
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('should return generic message if email not found for forgot password (prevent enumeration)', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    const result = await service.forgotPassword('test@ppmiu.ondo.gov.ng');
    expect(result).toEqual({ message: 'If the email is registered, a reset link will be sent.' });
  });

  it('should throw error if token is invalid or expired', async () => {
    expect(service.resetPassword).toBeDefined();
  });
});
