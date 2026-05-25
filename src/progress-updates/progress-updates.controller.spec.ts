import { Test, TestingModule } from '@nestjs/testing';
import { ProgressUpdatesController } from './progress-updates.controller';
import { ProgressUpdatesService } from './progress-updates.service';
import { Role, ReportStatus } from '@prisma/client';

describe('ProgressUpdatesController', () => {
  let controller: ProgressUpdatesController;
  let service: ProgressUpdatesService;

  const mockUpdatesService = {
    findAll: jest.fn(),
    findAllSubmitted: jest.fn(),
    findAllByMda: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressUpdatesController],
      providers: [
        {
          provide: ProgressUpdatesService,
          useValue: mockUpdatesService,
        },
      ],
    }).compile();

    controller = module.get<ProgressUpdatesController>(ProgressUpdatesController);
    service = module.get<ProgressUpdatesService>(ProgressUpdatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reports for webmaster with default pagination', async () => {
      const result = { data: [{ id: '1' }], meta: { total: 1, page: 1, limit: 25, totalPages: 1 } };
      mockUpdatesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll({ user: { role: Role.WEBMASTER_ADMIN } }, undefined, undefined, undefined)).toBe(result);
      expect(mockUpdatesService.findAll).toHaveBeenCalledWith({ page: 1, limit: 25, projectId: undefined });
    });

    it('should return submitted reports for ppimu admin with specified pagination', async () => {
      const result = { data: [{ id: '1', status: ReportStatus.SUBMITTED }], meta: { total: 1, page: 2, limit: 10, totalPages: 1 } };
      mockUpdatesService.findAllSubmitted.mockResolvedValue(result);

      expect(await controller.findAll({ user: { role: Role.PPIMU_ADMIN } }, '2', '10', 'proj-123')).toBe(result);
      expect(mockUpdatesService.findAllSubmitted).toHaveBeenCalledWith({ page: 2, limit: 10, projectId: 'proj-123' });
    });

    it('should return mda reports for mda officer', async () => {
      const result = { data: [{ id: '1' }], meta: { total: 1, page: 1, limit: 25, totalPages: 1 } };
      mockUpdatesService.findAllByMda.mockResolvedValue(result);

      expect(await controller.findAll({ user: { role: Role.MDA_OFFICER, mdaId: 'mda-1' } }, '1', '25', 'proj-456')).toBe(result);
      expect(mockUpdatesService.findAllByMda).toHaveBeenCalledWith('mda-1', { page: 1, limit: 25, projectId: 'proj-456' });
    });
  });

  describe('approve', () => {
    it('should approve progress update and return updated record', async () => {
      const result = { id: 'update-1', milestoneStatus: 'Approved' };
      mockUpdatesService.update.mockResolvedValue(result);

      expect(await controller.approve('update-1')).toBe(result);
      expect(mockUpdatesService.update).toHaveBeenCalledWith('update-1', { milestoneStatus: 'Approved' });
    });
  });

  describe('reject', () => {
    it('should reject progress update and return updated record', async () => {
      const result = { id: 'update-1', milestoneStatus: 'Changes Required' };
      mockUpdatesService.update.mockResolvedValue(result);

      expect(await controller.reject('update-1')).toBe(result);
      expect(mockUpdatesService.update).toHaveBeenCalledWith('update-1', { milestoneStatus: 'Changes Required' });
    });
  });
});
