import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(req: any, mdaIdQuery?: string): Promise<{
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
