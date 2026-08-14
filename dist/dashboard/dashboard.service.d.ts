import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(user: {
        role: Role;
        mdaId?: string;
    }, mdaIdQuery?: string): Promise<{
        metrics: {
            mdaCount: number;
            projectCount: number;
            inProgressCount: number;
            inProgressPct: number;
            avgProgress: number;
            avgProgressDelta: number;
        };
        stageBreakdown: {
            stage: string;
            count: number;
            pct: number;
        }[];
        recentProjects: {
            id: string;
            title: string;
            location: string;
            progress: number;
            stage: string;
        }[];
        issues: {
            openCount: number;
            trend: {
                label: string;
                value: number;
            }[];
        };
        topMdas: {
            mdaName: string;
            count: number;
        }[];
        pendingApprovalsCount: number;
        lastUpdated: string;
    }>;
}
