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
    create: jest.fn(),
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

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 'new@test.com', passwordHash: 'pass', role: Role.MDA_OFFICER };
      const result = { id: '2', email: 'new@test.com' };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a user if requesting user is WEBMASTER_ADMIN', async () => {
      const dto = { email: 'updated@test.com' };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.PPIMU_ADMIN } };
      const result = { id: '1', email: 'updated@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN } };
      expect(await controller.update(req, '1', dto)).toBe(result);
    });

    it('should update a user if requesting user is PPIMU_ADMIN and target is MDA_OFFICER', async () => {
      const dto = { email: 'updated@test.com' };
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      const result = { id: '1', email: 'updated@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.update.mockResolvedValue(result);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      expect(await controller.update(req, '1', dto)).toBe(result);
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
      expect(await controller.remove(req, '1')).toBe(result);
    });

    it('should remove a user if requesting user is PPIMU_ADMIN and target is MDA_OFFICER', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.MDA_OFFICER } };
      const result = { id: '1', email: 'deleted@test.com' };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);
      mockUsersService.remove.mockResolvedValue(result);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      expect(await controller.remove(req, '1')).toBe(result);
    });

    it('should throw ForbiddenException on remove if requesting user is PPIMU_ADMIN and target is not MDA_OFFICER', async () => {
      const targetUser = { id: '1', email: 'target@test.com', profile: { role: Role.PPIMU_ADMIN } };
      mockUsersService.findById = jest.fn().mockResolvedValue(targetUser);

      const req = { user: { role: Role.PPIMU_ADMIN } };
      await expect(controller.remove(req, '1')).rejects.toThrow();
    });
  });
});
