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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(user, mdaIdQuery) {
        const mdaId = user.role === client_1.Role.MDA_OFFICER ? user.mdaId : mdaIdQuery;
        const mdaCount = await this.prisma.mDA.count({
            where: mdaId ? { id: mdaId } : {},
        });
        const projects = await this.prisma.project.findMany({
            where: { ...(mdaId ? { mdaId } : {}), isArchived: false },
            include: {
                progressUpdates: {
                    orderBy: [
                        { reportDate: 'desc' },
                        { createdAt: 'desc' },
                    ],
                    take: 1,
                },
            },
        });
        const projectCount = projects.length;
        const inProgressCount = projects.filter((p) => p.status === 'Ongoing' || (p.progressUpdates[0]?.stage && p.progressUpdates[0]?.stage !== 'Completed')).length;
        const inProgressPct = projectCount > 0 ? Math.round((inProgressCount / projectCount) * 100) : 0;
        const avgProgress = projectCount > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.progressUpdates[0]?.physicalProgressPct || 0), 0) / projectCount)
            : 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const pastProjects = await this.prisma.project.findMany({
            where: { ...(mdaId ? { mdaId } : {}), isArchived: false },
            include: {
                progressUpdates: {
                    where: {
                        reportDate: { lt: thirtyDaysAgo },
                    },
                    orderBy: [
                        { reportDate: 'desc' },
                        { createdAt: 'desc' },
                    ],
                    take: 1,
                },
            },
        });
        const pastAvgProgress = pastProjects.length > 0
            ? Math.round(pastProjects.reduce((sum, p) => sum + (p.progressUpdates[0]?.physicalProgressPct || 0), 0) / pastProjects.length)
            : 0;
        const avgProgressDelta = avgProgress - pastAvgProgress;
        const stages = ['Execution', 'Procurement', 'Planning', 'Completed'];
        const stageCounts = { Execution: 0, Procurement: 0, Planning: 0, Completed: 0 };
        projects.forEach((p) => {
            const stage = p.progressUpdates[0]?.stage || 'Planning';
            if (stageCounts[stage] !== undefined) {
                stageCounts[stage]++;
            }
            else {
                stageCounts['Planning']++;
            }
        });
        const stageBreakdown = stages.map((stage) => ({
            stage,
            count: stageCounts[stage],
            pct: projectCount > 0 ? Math.round((stageCounts[stage] / projectCount) * 100) : 0,
        }));
        const recentUpdates = await this.prisma.progressUpdate.findMany({
            where: { project: { isArchived: false, ...(mdaId ? { mdaId } : {}) } },
            orderBy: [
                { reportDate: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 5,
            include: {
                project: true,
            },
        });
        const recentProjects = recentUpdates.map((u) => ({
            id: u.projectId,
            title: u.project.title,
            location: u.project.locationText,
            progress: u.physicalProgressPct,
            stage: u.stage,
        }));
        const openCount = await this.prisma.issue.count({
            where: {
                status: 'Open',
                project: { isArchived: false, ...(mdaId ? { mdaId } : {}) },
            },
        });
        const trend = [];
        const days = 7;
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-US', { weekday: 'short' });
            const startOfDay = new Date(d);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);
            const count = await this.prisma.issue.count({
                where: {
                    logDate: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    project: { isArchived: false, ...(mdaId ? { mdaId } : {}) },
                },
            });
            trend.push({ label, value: count });
        }
        const mdaProjectsCount = await this.prisma.project.groupBy({
            by: ['mdaId'],
            _count: {
                projectId: true,
            },
            where: { ...(mdaId ? { mdaId } : {}), isArchived: false },
        });
        const mdaIds = mdaProjectsCount.map((g) => g.mdaId);
        const mdaRecords = await this.prisma.mDA.findMany({
            where: { id: { in: mdaIds } },
        });
        const mdaMap = new Map(mdaRecords.map((m) => [m.id, m.name]));
        const topMdas = mdaProjectsCount
            .map((g) => ({
            mdaName: mdaMap.get(g.mdaId) || 'Unknown MDA',
            count: g._count.projectId,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const pendingApprovalsCount = await this.prisma.progressUpdate.count({
            where: {
                status: 'SUBMITTED',
                milestoneStatus: { not: 'Approved' },
                project: { isArchived: false, ...(mdaId ? { mdaId } : {}) },
            },
        });
        return {
            metrics: {
                mdaCount,
                projectCount,
                inProgressCount,
                inProgressPct,
                avgProgress,
                avgProgressDelta,
            },
            stageBreakdown,
            recentProjects,
            issues: {
                openCount,
                trend,
            },
            topMdas,
            pendingApprovalsCount,
            lastUpdated: new Date().toISOString(),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map