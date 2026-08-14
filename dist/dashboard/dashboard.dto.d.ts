export declare class DashboardMetricsDto {
    mdaCount: number;
    projectCount: number;
    inProgressCount: number;
    inProgressPct: number;
    avgProgress: number;
    avgProgressDelta: number;
}
export declare class StageBreakdownDto {
    stage: string;
    count: number;
    pct: number;
}
export declare class RecentProjectDto {
    id: string;
    title: string;
    location: string | null;
    progress: number;
    stage: string;
}
export declare class IssueTrendDto {
    label: string;
    value: number;
}
export declare class DashboardIssuesDto {
    openCount: number;
    trend: IssueTrendDto[];
}
export declare class TopMdaDto {
    mdaName: string;
    count: number;
}
export declare class DashboardOverviewResponseDto {
    metrics: DashboardMetricsDto;
    stageBreakdown: StageBreakdownDto[];
    recentProjects: RecentProjectDto[];
    issues: DashboardIssuesDto;
    topMdas: TopMdaDto[];
    pendingApprovalsCount: number;
    lastUpdated: string;
}
