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
          isArchived: false,
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
          isArchived: false,
        },
      });
    });

    it('should filter out archived projects by default', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);
      mockPrismaService.project.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isArchived: false,
          },
        }),
      );
    });
  });

  describe('importCsv', () => {
    it('should throw an error if parsing fails', async () => {
      const invalidCsvBuffer = Buffer.from('Title,Sector,LGA,SenatorialDistrict,LocationText,StartDate,EndDate,ApprovedBudget,FundingSource,Contractor,Status,MDA_Name\n,,,,,invalid_date,,,,,,');
      await expect(service.importCsv(invalidCsvBuffer)).rejects.toThrow();
    });
  });

  describe('getArchivedByYear', () => {
    it('should query projects where isArchived is true and startDate is within the given year', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);
      
      await service.getArchivedByYear(2025);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          isArchived: true,
          startDate: {
            gte: new Date('2025-01-01T00:00:00Z'),
            lte: new Date('2025-12-31T23:59:59Z')
          }
        },
        include: { mda: true, progressUpdates: true, financeRecords: true }
      });
    });
  });
});
