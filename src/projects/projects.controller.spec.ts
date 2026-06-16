import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Role } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const result = {
        data: [{ projectId: '1', title: 'Test Project' }],
        meta: { total: 1, page: 1, limit: 25, totalPages: 1 }
      };
      mockProjectsService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN, mdaId: null } };
      expect(await controller.findAll(req, undefined, undefined, '1', '25')).toBe(result);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith({
        mdaId: undefined,
        status: undefined,
        page: 1,
        limit: 25
      });
    });

    it('should pass users mdaId to service if not WEBMASTER_ADMIN', async () => {
      const result = {
        data: [{ projectId: '1', title: 'MDA Project' }],
        meta: { total: 1, page: 1, limit: 25, totalPages: 1 }
      };
      mockProjectsService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.MDA_OFFICER, mdaId: 'mda-123' } };
      expect(await controller.findAll(req, undefined, undefined, '2', '25')).toBe(result);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith({
        mdaId: 'mda-123',
        status: undefined,
        page: 2,
        limit: 25
      });
    });

    it('should cap limit at 100 to prevent DoS', async () => {
      const result = {
        data: [],
        meta: { total: 0, page: 1, limit: 100, totalPages: 0 }
      };
      mockProjectsService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN, mdaId: null } };
      await controller.findAll(req, undefined, undefined, '1', '100000');
      expect(mockProjectsService.findAll).toHaveBeenCalledWith({
        mdaId: undefined,
        status: undefined,
        page: 1,
        limit: 100
      });
    });
  });

  describe('findOne', () => {
    it('should pass req.user to service findOne', async () => {
      const req = { user: { role: Role.MDA_OFFICER, mdaId: 'mda-1' } };
      const project = { projectId: 'proj-1' };
      mockProjectsService.findOne.mockResolvedValue(project);

      expect(await controller.findOne('proj-1', req)).toBe(project);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith('proj-1', req.user);
    });
  });
});
