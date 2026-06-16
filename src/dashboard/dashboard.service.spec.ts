import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const mockPrismaService = {
    mDA: {
        count: jest.fn(),
        findMany: jest.fn(),
    },
    project: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
    },
    progressUpdate: {
        findMany: jest.fn(),
        count: jest.fn(),
    },
    issue: {
        count: jest.fn(),
    },
};

describe('DashboardService', () => {
    let service: DashboardService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getOverview', () => {
        it('should return aggregated dashboard data for WEBMASTER_ADMIN', async () => {
            // Mock implementations
            mockPrismaService.mDA.count.mockResolvedValue(10);
            
            // Mock projects with progress updates
            mockPrismaService.project.findMany.mockResolvedValueOnce([
                { id: 'p1', mdaId: 'm1', status: 'Ongoing', progressUpdates: [{ physicalProgressPct: 50, stage: 'Execution' }] },
                { id: 'p2', mdaId: 'm1', status: 'Completed', progressUpdates: [{ physicalProgressPct: 100, stage: 'Completed' }] },
            ]);
            
            // Mock past projects for delta
            mockPrismaService.project.findMany.mockResolvedValueOnce([
                { id: 'p1', mdaId: 'm1', status: 'Ongoing', progressUpdates: [{ physicalProgressPct: 40, stage: 'Execution' }] },
                { id: 'p2', mdaId: 'm1', status: 'Completed', progressUpdates: [{ physicalProgressPct: 100, stage: 'Completed' }] },
            ]);

            // Mock recent updates
            mockPrismaService.progressUpdate.findMany.mockResolvedValue([
                { projectId: 'p1', physicalProgressPct: 50, stage: 'Execution', project: { title: 'Project 1', locationText: 'Location 1' } }
            ]);

            // Mock issues
            mockPrismaService.issue.count.mockResolvedValue(5);

            // Mock top MDAs
            mockPrismaService.project.groupBy.mockResolvedValue([
                { mdaId: 'm1', _count: { projectId: 2 } }
            ]);
            mockPrismaService.mDA.findMany.mockResolvedValue([
                { id: 'm1', name: 'MDA 1' }
            ]);

            // Mock pending approvals
            mockPrismaService.progressUpdate.count.mockResolvedValue(3);

            const result = await service.getOverview({ role: Role.WEBMASTER_ADMIN });

            expect(result).toBeDefined();
            expect(result.metrics.mdaCount).toBe(10);
            expect(result.metrics.projectCount).toBe(2);
            expect(result.metrics.inProgressCount).toBe(1);
            expect(result.metrics.inProgressPct).toBe(50);
            expect(result.metrics.avgProgress).toBe(75);
            expect(result.metrics.avgProgressDelta).toBe(5); // 75 - 70

            expect(result.stageBreakdown).toHaveLength(4);
            expect(result.recentProjects).toHaveLength(1);
            expect(result.issues.openCount).toBe(5);
            expect(result.issues.trend).toHaveLength(7); // 7 days of trend
            expect(result.topMdas).toHaveLength(1);
            expect(result.topMdas[0].mdaName).toBe('MDA 1');
            expect(result.pendingApprovalsCount).toBe(3);
        });

        it('should enforce MDA_OFFICER scoping', async () => {
            // Setup simple mocks
            mockPrismaService.mDA.count.mockResolvedValue(1);
            mockPrismaService.project.findMany.mockResolvedValue([]);
            mockPrismaService.progressUpdate.findMany.mockResolvedValue([]);
            mockPrismaService.issue.count.mockResolvedValue(0);
            mockPrismaService.project.groupBy.mockResolvedValue([]);
            mockPrismaService.mDA.findMany.mockResolvedValue([]);
            mockPrismaService.progressUpdate.count.mockResolvedValue(0);

            await service.getOverview({ role: Role.MDA_OFFICER, mdaId: 'officer-mda-id' });

            // Verify prisma was called with officer's mdaId
            expect(mockPrismaService.mDA.count).toHaveBeenCalledWith({
                where: { id: 'officer-mda-id' },
            });
            expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { mdaId: 'officer-mda-id' } })
            );
        });
    });
});
