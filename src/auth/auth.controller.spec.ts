import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Role } from '@prisma/client';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ROLES_KEY } from './decorators/roles.decorator';

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

  // Guards do not execute in direct-method unit tests, so assert the route
  // metadata instead. Registration was previously fully public and honoured a
  // client-supplied `role`, which allowed anyone to mint a WEBMASTER_ADMIN.
  describe('register authorization metadata', () => {
    it('should require JWT + Roles guards on register', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.register) ?? [];
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RolesGuard);
    });

    it('should restrict register to WEBMASTER_ADMIN', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, AuthController.prototype.register);
      expect(roles).toEqual([Role.WEBMASTER_ADMIN]);
    });

    it('should leave login, forgot-password and reset-password public', () => {
      for (const handler of [
        AuthController.prototype.login,
        AuthController.prototype.forgotPassword,
        AuthController.prototype.resetPassword,
      ]) {
        expect(Reflect.getMetadata('__guards__', handler)).toBeUndefined();
      }
      // ...and no class-level guard silently locking them down either.
      expect(Reflect.getMetadata('__guards__', AuthController)).toBeUndefined();
    });
  });
});
