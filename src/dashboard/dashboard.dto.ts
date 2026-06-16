import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
    @ApiProperty({ description: 'Total number of MDAs' })
    mdaCount!: number;

    @ApiProperty({ description: 'Total number of projects' })
    projectCount!: number;

    @ApiProperty({ description: 'Number of projects currently in progress' })
    inProgressCount!: number;

    @ApiProperty({ description: 'Percentage of projects in progress' })
    inProgressPct!: number;

    @ApiProperty({ description: 'Average physical progress across all projects' })
    avgProgress!: number;

    @ApiProperty({ description: 'Change in average progress compared to the previous period' })
    avgProgressDelta!: number;
}

export class StageBreakdownDto {
    @ApiProperty({ description: 'The project stage (e.g., Execution, Procurement)' })
    stage!: string;

    @ApiProperty({ description: 'Number of projects in this stage' })
    count!: number;

    @ApiProperty({ description: 'Percentage of total projects in this stage' })
    pct!: number;
}

export class RecentProjectDto {
    @ApiProperty({ description: 'Project ID' })
    id!: string;

    @ApiProperty({ description: 'Project Title' })
    title!: string;

    @ApiProperty({ description: 'Project Location', nullable: true })
    location!: string | null;

    @ApiProperty({ description: 'Latest physical progress percentage' })
    progress!: number;

    @ApiProperty({ description: 'Current stage of the project' })
    stage!: string;
}

export class IssueTrendDto {
    @ApiProperty({ description: 'Label for the trend data point (e.g., day of week)' })
    label!: string;

    @ApiProperty({ description: 'Number of issues for this point in time' })
    value!: number;
}

export class DashboardIssuesDto {
    @ApiProperty({ description: 'Total number of open issues' })
    openCount!: number;

    @ApiProperty({ type: [IssueTrendDto], description: 'Trend of issue volume over recent days' })
    trend!: IssueTrendDto[];
}

export class TopMdaDto {
    @ApiProperty({ description: 'Name of the MDA' })
    mdaName!: string;

    @ApiProperty({ description: 'Number of projects managed by this MDA' })
    count!: number;
}

export class DashboardOverviewResponseDto {
    @ApiProperty({ type: DashboardMetricsDto, description: 'Core KPI metrics' })
    metrics!: DashboardMetricsDto;

    @ApiProperty({ type: [StageBreakdownDto], description: 'Project breakdown by current stage' })
    stageBreakdown!: StageBreakdownDto[];

    @ApiProperty({ type: [RecentProjectDto], description: 'List of recently updated projects' })
    recentProjects!: RecentProjectDto[];

    @ApiProperty({ type: DashboardIssuesDto, description: 'Active issues and trend data' })
    issues!: DashboardIssuesDto;

    @ApiProperty({ type: [TopMdaDto], description: 'Top MDAs by project count' })
    topMdas!: TopMdaDto[];

    @ApiProperty({ description: 'Number of progress updates awaiting approval' })
    pendingApprovalsCount!: number;

    @ApiProperty({ description: 'Timestamp of when the dashboard data was generated' })
    lastUpdated!: string;
}
