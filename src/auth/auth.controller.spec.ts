import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.forgotPassword', async () => {
    authService.forgotPassword.mockResolvedValue({ message: 'Email sent' });
    const result = await controller.forgotPassword({ email: 'test@test.com' });
    expect(authService.forgotPassword).toHaveBeenCalledWith('test@test.com');
    expect(result).toEqual({ message: 'Email sent' });
  });

  it('should call authService.resetPassword', async () => {
    authService.resetPassword.mockResolvedValue({ message: 'Password reset' });
    const result = await controller.resetPassword({ token: 'abc', newPassword: '123' });
    expect(authService.resetPassword).toHaveBeenCalledWith('abc', '123');
    expect(result).toEqual({ message: 'Password reset' });
  });
});
