import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Role } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

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
        data: [{ id: '1', title: 'Test Project' }],
        meta: { total: 1, page: 1, limit: 25, totalPages: 1 }
      };
      mockProjectsService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.WEBMASTER_ADMIN, mdaId: null } };
      expect(await controller.findAll(req, undefined, '1', '25')).toBe(result);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith({
        mdaId: undefined,
        page: 1,
        limit: 25
      });
    });

    it('should pass users mdaId to service if not WEBMASTER_ADMIN', async () => {
      const result = {
        data: [{ id: '1', title: 'MDA Project' }],
        meta: { total: 1, page: 1, limit: 25, totalPages: 1 }
      };
      mockProjectsService.findAll.mockResolvedValue(result);

      const req = { user: { role: Role.MDA_OFFICER, mdaId: 'mda-123' } };
      expect(await controller.findAll(req, undefined, '2', '25')).toBe(result);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith({
        mdaId: 'mda-123',
        page: 2,
        limit: 25
      });
    });
  });
});
