import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockMDAs = [
    { id: 'mda-1', name: 'Ministry of Works' },
    { id: 'mda-2', name: 'Ministry of Health' },
  ];

  const mockProjects = [
    {
      projectId: 'project-1',
      title: 'Road Construction',
      sector: 'Infrastructure',
      lga: 'Akure South',
      senatorialDistrict: 'Ondo Central',
      fundingSource: 'State Budget',
      contractor: 'Builder A',
      status: 'Ongoing',
      approvedBudget: 1000000,
      mdaId: 'mda-1',
      mda: { name: 'Ministry of Works' },
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      progressUpdates: [
        {
          id: 'u-1',
          reportDate: new Date('2026-06-15'),
          physicalProgressPct: 50,
          status: 'SUBMITTED',
          createdAt: new Date('2026-06-15'),
        },
      ],
      financeRecords: [
        {
          id: 'f-1',
          budgetYear: 2026,
          releaseToDate: 500000,
          paymentsToDate: 400000,
        },
      ],
      issues: [
        {
          id: 'i-1',
          issueCategory: 'Funding',
          issueItem: 'Delay in cash release',
          severity: 3,
          status: 'Open',
          dueDate: new Date('2026-05-30'),
          logDate: new Date('2026-05-01'),
        },
      ],
    },
  ];

  const mockPrismaService = {
    mDA: {
      findMany: jest.fn().mockResolvedValue(mockMDAs),
    },
    project: {
      findMany: jest.fn().mockResolvedValue(mockProjects),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReportAnalytics', () => {
    it('should aggregate data correctly for a monthly report', async () => {
      const result = await service.getReportAnalytics(2026, 'monthly', 6);

      // Executive overview assertions
      expect(result.executiveOverview.totalProjects).toBe(1);
      expect(result.executiveOverview.statusDistribution.Ongoing).toBe(1);
      expect(result.executiveOverview.financials.totalBudget).toBe(1000000);
      expect(result.executiveOverview.financials.totalReleased).toBe(500000);
      expect(result.executiveOverview.financials.totalPayments).toBe(400000);
      expect(result.executiveOverview.financials.disbursementRate).toBe(80);
      expect(result.executiveOverview.avgPhysicalProgress).toBe(50);
      expect(result.executiveOverview.activeIssuesCount).toBe(1);

      // Sector geographical assertions
      expect(result.sectorGeographical.sectors[0]).toEqual({
        name: 'Infrastructure',
        projectCount: 1,
        totalBudget: 1000000,
        totalReleased: 500000,
        totalPayments: 400000,
        avgPhysicalProgress: 50,
      });

      // MDA scorecard assertions
      const worksMda = result.mdaScorecard.find((m) => m.mdaId === 'mda-1');
      expect(worksMda).toBeDefined();
      expect(worksMda.projectCount).toBe(1);
      expect(worksMda.updatesLogged).toBe(1);
      expect(worksMda.updatesSubmitted).toBe(1);

      // Finance & Cost Variance assertions
      expect(result.financeCost[0].costVariance).toBe(-10); // 40% spent - 50% progress = -10

      // Risk & Bottlenecks assertions
      expect(result.riskBottlenecks.issueCategories[0]).toEqual({
        category: 'Funding',
        count: 1,
      });
      expect(result.riskBottlenecks.overdueIssues.length).toBe(1);
      expect(result.riskBottlenecks.overdueIssues[0].issueItem).toBe('Delay in cash release');
      expect(result.riskBottlenecks.topContractors[0].contractor).toBe('Builder A');
    });
  });
});
