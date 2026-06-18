import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';

import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should include lga filter in where clause if provided', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);
      mockPrismaService.project.count.mockResolvedValue(0);

      await service.findAll({ lga: 'Ondo East' });

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          lga: {
            contains: 'Ondo East',
          },
        },
        skip: 0,
        take: 25,
        include: { mda: true, progressUpdates: true },
      });

      expect(mockPrismaService.project.count).toHaveBeenCalledWith({
        where: {
          lga: {
            contains: 'Ondo East',
          },
        },
      });
    });
  });
});
