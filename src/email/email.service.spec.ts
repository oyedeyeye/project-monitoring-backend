import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a password setup email', async () => {
    const mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
    (service as any).transporter = mockTransporter;

    await service.sendPasswordSetupEmail('test@ppmiu.ondo.gov.ng', '12345');
    
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@ppmiu.ondo.gov.ng',
      subject: 'Welcome to PPMIU - Setup Your Password',
      text: expect.stringContaining('12345'),
    }));
  });

  it('should send a password reset email', async () => {
    const mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
    (service as any).transporter = mockTransporter;

    await service.sendPasswordResetEmail('test@ppmiu.ondo.gov.ng', 'abcde');
    
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@ppmiu.ondo.gov.ng',
      subject: 'PPMIU - Password Reset Request',
      text: expect.stringContaining('abcde'),
    }));
  });

  it('should send an account created email containing password', async () => {
    const mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
    (service as any).transporter = mockTransporter;

    await service.sendAccountCreatedEmail('test@ppmiu.ondo.gov.ng', 'adminSecretPass123');

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@ppmiu.ondo.gov.ng',
      subject: 'Welcome to PPMIU - Account Details',
      text: expect.stringContaining('adminSecretPass123'),
    }));
  });
});
