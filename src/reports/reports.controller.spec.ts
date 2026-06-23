import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { BadRequestException } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    getReportAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should parse and forward valid monthly parameters', async () => {
      mockReportsService.getReportAnalytics.mockResolvedValue({ success: true });

      const result = await controller.getAnalytics('2026', 'monthly', '6');

      expect(result).toEqual({ success: true });
      expect(mockReportsService.getReportAnalytics).toHaveBeenCalledWith(2026, 'monthly', 6);
    });

    it('should parse and forward valid quarterly parameters', async () => {
      mockReportsService.getReportAnalytics.mockResolvedValue({ success: true });

      const result = await controller.getAnalytics('2026', 'quarterly', '2');

      expect(result).toEqual({ success: true });
      expect(mockReportsService.getReportAnalytics).toHaveBeenCalledWith(2026, 'quarterly', 2);
    });

    it('should throw BadRequestException if year is missing or invalid', async () => {
      await expect(controller.getAnalytics('', 'monthly', '6')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getAnalytics('invalid', 'monthly', '6')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if type is invalid', async () => {
      await expect(
        controller.getAnalytics('2026', 'yearly' as any, '6'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if value is out of bounds', async () => {
      await expect(controller.getAnalytics('2026', 'monthly', '13')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getAnalytics('2026', 'quarterly', '5')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
