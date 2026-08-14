"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardOverviewResponseDto = exports.TopMdaDto = exports.DashboardIssuesDto = exports.IssueTrendDto = exports.RecentProjectDto = exports.StageBreakdownDto = exports.DashboardMetricsDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class DashboardMetricsDto {
    mdaCount;
    projectCount;
    inProgressCount;
    inProgressPct;
    avgProgress;
    avgProgressDelta;
    static _OPENAPI_METADATA_FACTORY() {
        return { mdaCount: { required: true, type: () => Number }, projectCount: { required: true, type: () => Number }, inProgressCount: { required: true, type: () => Number }, inProgressPct: { required: true, type: () => Number }, avgProgress: { required: true, type: () => Number }, avgProgressDelta: { required: true, type: () => Number } };
    }
}
exports.DashboardMetricsDto = DashboardMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of MDAs' }),
    __metadata("design:type", Number)
], DashboardMetricsDto.prototype, "mdaCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of projects' }),
    __metadata("design:type", Number)
], DashboardMetricsDto.prototype, "projectCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of projects currently in progress' }),
    __metadata("design:type", Number)
], DashboardMetricsDto.prototype, "inProgressCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage of projects in progress' }),
    __metadata("design:type", Number)
], DashboardMetricsDto.prototype, "inProgressPct", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average physical progress across all projects' }),
    __metadata("design:type", Number)
], DashboardMetricsDto.prototype, "avgProgress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Change in average progress compared to the previous period' }),
    __metadata("design:type", Number)
], DashboardMetricsDto.prototype, "avgProgressDelta", void 0);
class StageBreakdownDto {
    stage;
    count;
    pct;
    static _OPENAPI_METADATA_FACTORY() {
        return { stage: { required: true, type: () => String }, count: { required: true, type: () => Number }, pct: { required: true, type: () => Number } };
    }
}
exports.StageBreakdownDto = StageBreakdownDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The project stage (e.g., Execution, Procurement)' }),
    __metadata("design:type", String)
], StageBreakdownDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of projects in this stage' }),
    __metadata("design:type", Number)
], StageBreakdownDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage of total projects in this stage' }),
    __metadata("design:type", Number)
], StageBreakdownDto.prototype, "pct", void 0);
class RecentProjectDto {
    id;
    title;
    location;
    progress;
    stage;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, title: { required: true, type: () => String }, location: { required: true, type: () => String, nullable: true }, progress: { required: true, type: () => Number }, stage: { required: true, type: () => String } };
    }
}
exports.RecentProjectDto = RecentProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project ID' }),
    __metadata("design:type", String)
], RecentProjectDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project Title' }),
    __metadata("design:type", String)
], RecentProjectDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project Location', nullable: true }),
    __metadata("design:type", Object)
], RecentProjectDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latest physical progress percentage' }),
    __metadata("design:type", Number)
], RecentProjectDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current stage of the project' }),
    __metadata("design:type", String)
], RecentProjectDto.prototype, "stage", void 0);
class IssueTrendDto {
    label;
    value;
    static _OPENAPI_METADATA_FACTORY() {
        return { label: { required: true, type: () => String }, value: { required: true, type: () => Number } };
    }
}
exports.IssueTrendDto = IssueTrendDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Label for the trend data point (e.g., day of week)' }),
    __metadata("design:type", String)
], IssueTrendDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of issues for this point in time' }),
    __metadata("design:type", Number)
], IssueTrendDto.prototype, "value", void 0);
class DashboardIssuesDto {
    openCount;
    trend;
    static _OPENAPI_METADATA_FACTORY() {
        return { openCount: { required: true, type: () => Number }, trend: { required: true, type: () => [require("./dashboard.dto").IssueTrendDto] } };
    }
}
exports.DashboardIssuesDto = DashboardIssuesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of open issues' }),
    __metadata("design:type", Number)
], DashboardIssuesDto.prototype, "openCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IssueTrendDto], description: 'Trend of issue volume over recent days' }),
    __metadata("design:type", Array)
], DashboardIssuesDto.prototype, "trend", void 0);
class TopMdaDto {
    mdaName;
    count;
    static _OPENAPI_METADATA_FACTORY() {
        return { mdaName: { required: true, type: () => String }, count: { required: true, type: () => Number } };
    }
}
exports.TopMdaDto = TopMdaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the MDA' }),
    __metadata("design:type", String)
], TopMdaDto.prototype, "mdaName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of projects managed by this MDA' }),
    __metadata("design:type", Number)
], TopMdaDto.prototype, "count", void 0);
class DashboardOverviewResponseDto {
    metrics;
    stageBreakdown;
    recentProjects;
    issues;
    topMdas;
    pendingApprovalsCount;
    lastUpdated;
    static _OPENAPI_METADATA_FACTORY() {
        return { metrics: { required: true, type: () => require("./dashboard.dto").DashboardMetricsDto }, stageBreakdown: { required: true, type: () => [require("./dashboard.dto").StageBreakdownDto] }, recentProjects: { required: true, type: () => [require("./dashboard.dto").RecentProjectDto] }, issues: { required: true, type: () => require("./dashboard.dto").DashboardIssuesDto }, topMdas: { required: true, type: () => [require("./dashboard.dto").TopMdaDto] }, pendingApprovalsCount: { required: true, type: () => Number }, lastUpdated: { required: true, type: () => String } };
    }
}
exports.DashboardOverviewResponseDto = DashboardOverviewResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: DashboardMetricsDto, description: 'Core KPI metrics' }),
    __metadata("design:type", DashboardMetricsDto)
], DashboardOverviewResponseDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StageBreakdownDto], description: 'Project breakdown by current stage' }),
    __metadata("design:type", Array)
], DashboardOverviewResponseDto.prototype, "stageBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RecentProjectDto], description: 'List of recently updated projects' }),
    __metadata("design:type", Array)
], DashboardOverviewResponseDto.prototype, "recentProjects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DashboardIssuesDto, description: 'Active issues and trend data' }),
    __metadata("design:type", DashboardIssuesDto)
], DashboardOverviewResponseDto.prototype, "issues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TopMdaDto], description: 'Top MDAs by project count' }),
    __metadata("design:type", Array)
], DashboardOverviewResponseDto.prototype, "topMdas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of progress updates awaiting approval' }),
    __metadata("design:type", Number)
], DashboardOverviewResponseDto.prototype, "pendingApprovalsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of when the dashboard data was generated' }),
    __metadata("design:type", String)
], DashboardOverviewResponseDto.prototype, "lastUpdated", void 0);
//# sourceMappingURL=dashboard.dto.js.map