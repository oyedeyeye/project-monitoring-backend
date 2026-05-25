import { Test, TestingModule } from '@nestjs/testing';
import { ProgressUpdatesService } from './progress-updates.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReportStatus } from '@prisma/client';

describe('ProgressUpdatesService', () => {
  let service: ProgressUpdatesService;
  let prisma: PrismaService;

  const mockProgressUpdate = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  };

  const mockPrismaService = {
    progressUpdate: mockProgressUpdate,
  };

  const mockNotificationsService = {
    emitNewUpdateSubmitted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressUpdatesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ProgressUpdatesService>(ProgressUpdatesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should paginate all progress updates correctly', async () => {
      const mockData = [{ id: '1' }];
      mockProgressUpdate.findMany.mockResolvedValue(mockData);
      mockProgressUpdate.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 2, limit: 10, projectId: 'proj-1' });

      expect(mockProgressUpdate.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(mockProgressUpdate.count).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
      });
      expect(result).toEqual({
        data: mockData,
        meta: {
          total: 1,
          page: 2,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('findAllSubmitted', () => {
    it('should paginate all submitted progress updates correctly', async () => {
      const mockData = [{ id: '2' }];
      mockProgressUpdate.findMany.mockResolvedValue(mockData);
      mockProgressUpdate.count.mockResolvedValue(20);

      const result = await service.findAllSubmitted({ page: 1, limit: 5 });

      expect(mockProgressUpdate.findMany).toHaveBeenCalledWith({
        where: { status: ReportStatus.SUBMITTED },
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 5,
      });
      expect(mockProgressUpdate.count).toHaveBeenCalledWith({
        where: { status: ReportStatus.SUBMITTED },
      });
      expect(result).toEqual({
        data: mockData,
        meta: {
          total: 20,
          page: 1,
          limit: 5,
          totalPages: 4,
        },
      });
    });
  });

  describe('findAllByMda', () => {
    it('should paginate progress updates filtered by MDA correctly', async () => {
      const mockData = [{ id: '3' }];
      mockProgressUpdate.findMany.mockResolvedValue(mockData);
      mockProgressUpdate.count.mockResolvedValue(40);

      const result = await service.findAllByMda('mda-123', { page: 3, limit: 15, projectId: 'proj-3' });

      expect(mockProgressUpdate.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'proj-3',
          project: { mdaId: 'mda-123' },
        },
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        skip: 30,
        take: 15,
      });
      expect(mockProgressUpdate.count).toHaveBeenCalledWith({
        where: {
          projectId: 'proj-3',
          project: { mdaId: 'mda-123' },
        },
      });
      expect(result).toEqual({
        data: mockData,
        meta: {
          total: 40,
          page: 3,
          limit: 15,
          totalPages: 3,
        },
      });
    });
  });

  describe('create and update with event emission', () => {
    const mockFullRecord = {
      id: 'update-123',
      projectId: 'proj-123',
      reportDate: new Date(),
      physicalProgressPct: 85,
      stage: 'Execution',
      status: ReportStatus.SUBMITTED,
      project: {
        title: 'Project Alpha',
        mda: {
          name: 'Ministry of Infrastructure',
        },
      },
    };

    it('should broadcast notification when creating a submitted progress update', async () => {
      mockProgressUpdate.create.mockResolvedValue({ id: 'update-123', status: ReportStatus.SUBMITTED });
      mockProgressUpdate.findUnique.mockResolvedValue(mockFullRecord);

      await service.create({
        project: { connect: { id: 'proj-123' } },
        reportDate: new Date(),
        physicalProgressPct: 85,
        stage: 'Execution',
        milestoneStatus: 'Ready for Approval',
        keyUpdate: 'Key comments',
        status: ReportStatus.SUBMITTED,
      });

      expect(mockNotificationsService.emitNewUpdateSubmitted).toHaveBeenCalledWith({
        id: 'update-123',
        projectId: 'proj-123',
        projectTitle: 'Project Alpha',
        mdaName: 'Ministry of Infrastructure',
        submittedAt: mockFullRecord.reportDate.toISOString(),
        physicalProgressPct: 85,
      });
    });

    it('should support creating progress update with direct projectId (Unchecked input)', async () => {
      const mockResult = { id: 'update-456', status: ReportStatus.DRAFT, projectId: 'proj-456' };
      mockProgressUpdate.create.mockResolvedValue(mockResult);

      const result = await service.create({
        projectId: 'proj-456',
        reportDate: new Date(),
        physicalProgressPct: 40,
        stage: 'Planning',
        milestoneStatus: 'Draft',
        keyUpdate: 'Draft comments',
        status: ReportStatus.DRAFT,
      });

      expect(mockProgressUpdate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'proj-456',
          status: ReportStatus.DRAFT,
        }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should support updating progress update with direct projectId (Unchecked input)', async () => {
      const mockResult = { id: 'update-456', status: ReportStatus.DRAFT, projectId: 'proj-789' };
      mockProgressUpdate.update.mockResolvedValue(mockResult);

      const result = await service.update('update-456', {
        projectId: 'proj-789',
        physicalProgressPct: 50,
      });

      expect(mockProgressUpdate.update).toHaveBeenCalledWith({
        where: { id: 'update-456' },
        data: expect.objectContaining({
          projectId: 'proj-789',
          physicalProgressPct: 50,
        }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should broadcast notification when updating a progress update to submitted', async () => {
      mockProgressUpdate.update.mockResolvedValue({ id: 'update-123', status: ReportStatus.SUBMITTED });
      mockProgressUpdate.findUnique.mockResolvedValue(mockFullRecord);

      await service.update('update-123', {
        status: ReportStatus.SUBMITTED,
      });

      expect(mockNotificationsService.emitNewUpdateSubmitted).toHaveBeenCalledWith({
        id: 'update-123',
        projectId: 'proj-123',
        projectTitle: 'Project Alpha',
        mdaName: 'Ministry of Infrastructure',
        submittedAt: mockFullRecord.reportDate.toISOString(),
        physicalProgressPct: 85,
      });
    });

    it('should NOT broadcast notification if status is DRAFT', async () => {
      mockProgressUpdate.create.mockResolvedValue({ id: 'update-123', status: ReportStatus.DRAFT });
      mockProgressUpdate.findUnique.mockResolvedValue({ ...mockFullRecord, status: ReportStatus.DRAFT });

      await service.create({
        project: { connect: { id: 'proj-123' } },
        reportDate: new Date(),
        physicalProgressPct: 85,
        stage: 'Execution',
        milestoneStatus: 'Draft',
        keyUpdate: 'Key comments',
        status: ReportStatus.DRAFT,
      });

      expect(mockNotificationsService.emitNewUpdateSubmitted).not.toHaveBeenCalled();
    });
  });
});

