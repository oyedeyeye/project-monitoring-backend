import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    // Required by the not.toHaveBeenCalled() assertions below; call counts
    // would otherwise leak between tests.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated response with data and meta', async () => {
      const result = {
        data: [{ id: '1', email: 'test@test.com', profile: { role: Role.MDA_OFFICER } }],
        meta: { total: 1, page: 1, limit: 25, totalPages: 1 }
      };
      mockUsersService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      expect(await controller.findAll(req, '1', '25')).toBe(result);
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 25,
        role: undefined,
      });
    });

    it('should filter strictly to MDA_OFFICER role when requesting user is PPIMU_ADMIN', async () => {
      const result = {
        data: [{ id: '1', email: 'officer@test.com', profile: { role: Role.MDA_OFFICER } }],
        meta: { total: 1, page: 1, limit: 25, totalPages: 1 }
      };
      mockUsersService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      await controller.findAll(req, '1', '25');
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 25,
        role: Role.MDA_OFFICER,
      });
    });
  });

  // NOTE: POST /users was removed — it persisted `passwordHash` verbatim from
  // the request body. User creation now goes through POST /auth/register only.

  describe('update', () => {
    it('should update a user if requesting user is WEBMASTER_ADMIN', async () => {
      const dto = { email: 'updated@test.com' };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.PPIMU_ADMIN } };
      const result = { id: '1', email: 'updated@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      expect(await controller.update(req, '1', dto)).toEqual(result);
    });

    it('should update a user if requesting user is PPIMU_ADMIN and target is MDA_OFFICER', async () => {
      const dto = { email: 'updated@test.com' };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      const result = { id: '1', email: 'updated@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue(result);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      expect(await controller.update(req, '1', dto)).toEqual(result);
    });

    it('should forbid a PPIMU_ADMIN from promoting an MDA_OFFICER to a higher role', async () => {
      const dto = { role: Role.WEBMASTER_ADMIN };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue({ id: '1' });

      const req = { user: { role: Role.PPIMU_ADMIN } };
      await expect(controller.update(req, '1', dto)).rejects.toThrow(
        'You can only assign the MDA Officer role',
      );
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should allow a WEBMASTER_ADMIN to change roles', async () => {
      const dto = { role: Role.WEBMASTER_ADMIN };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue({ id: '1' });

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      await controller.update(req, '1', dto);

      expect(mockUsersService.update).toHaveBeenCalledWith('1', {
        profile: { update: { role: Role.WEBMASTER_ADMIN } },
      });
    });

    it('should never expose passwordHash or reset token in the response', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue({
        id: '1',
        email: 'target@test.com',
        passwordHash: '$2b$10$notarealhash',
        resetPasswordToken: 'sha256digest',
        resetPasswordExpires: new Date(),
      });

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      const response: any = await controller.update(req, '1', { email: 'target@test.com' });

      expect(response).not.toHaveProperty('passwordHash');
      expect(response).not.toHaveProperty('resetPasswordToken');
      expect(response).not.toHaveProperty('resetPasswordExpires');
      expect(response.email).toBe('target@test.com');
    });

    it('should ignore client-supplied passwordHash (no raw Prisma passthrough)', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue({ id: '1' });

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      await controller.update(req, '1', { passwordHash: 'attacker-chosen' } as any);

      expect(mockUsersService.update).toHaveBeenCalledWith('1', {});
    });

    it('should throw ForbiddenException if requesting user is PPIMU_ADMIN and target is not MDA_OFFICER', async () => {
      const dto = { email: 'updated@test.com' };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.PPIMU_ADMIN } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      await expect(controller.update(req, '1', dto)).rejects.toThrow();
    });

    it('should intercept password, hash it using bcrypt, and set passwordHash on update', async () => {
      const dto = { password: 'newSecurePassword123' } as any;
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      const result = { id: '1', email: 'target@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      await controller.update(req, '1', dto);

      expect(mockUsersService.update).toHaveBeenCalledWith('1', expect.objectContaining({
        passwordHash: expect.any(String)
      }));
      expect(mockUsersService.update).not.toHaveBeenCalledWith('1', expect.objectContaining({
        password: expect.any(String)
      }));
    });
  });

  describe('remove', () => {
    it('should remove a user if requesting user is WEBMASTER_ADMIN', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.PPIMU_ADMIN } };
      const result = { id: '1', email: 'deleted@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.remove.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      expect(await controller.remove(req, '1')).toEqual(result);
    });

    it('should remove a user if requesting user is PPIMU_ADMIN and target is MDA_OFFICER', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      const result = { id: '1', email: 'deleted@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.remove.mockResolvedValue(result);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      expect(await controller.remove(req, '1')).toEqual(result);
    });

    it('should throw ForbiddenException on remove if requesting user is PPIMU_ADMIN and target is not MDA_OFFICER', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.PPIMU_ADMIN } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      await expect(controller.remove(req, '1')).rejects.toThrow();
    });
  });
});
