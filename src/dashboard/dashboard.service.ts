import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getOverview(user: { role: Role; mdaId?: string }, mdaIdQuery?: string) {
        // Enforce role scoping: MDA_OFFICER can ONLY see their own MDA's data
        const mdaId = user.role === Role.MDA_OFFICER ? user.mdaId : mdaIdQuery;

        // 1. Fetch MDAs count
        const mdaCount = await this.prisma.mDA.count({
            where: mdaId ? { id: mdaId } : {},
        });

        // 2. Fetch all projects with their latest progress update
        const projects = await this.prisma.project.findMany({
            where: mdaId ? { mdaId } : {},
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

        // Calculate inProgressCount: status === 'Ongoing' or latest stage !== 'Completed'
        const inProgressCount = projects.filter(
            (p) => p.status === 'Ongoing' || (p.progressUpdates[0]?.stage && p.progressUpdates[0]?.stage !== 'Completed'),
        ).length;

        const inProgressPct = projectCount > 0 ? Math.round((inProgressCount / projectCount) * 100) : 0;

        // Average progress of latest updates
        const avgProgress = projectCount > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.progressUpdates[0]?.physicalProgressPct || 0), 0) / projectCount)
            : 0;

        // Avg Progress Delta against 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const pastProjects = await this.prisma.project.findMany({
            where: mdaId ? { mdaId } : {},
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

        // 3. Stage breakdown
        const stages = ['Execution', 'Procurement', 'Planning', 'Completed'];
        const stageCounts: Record<string, number> = { Execution: 0, Procurement: 0, Planning: 0, Completed: 0 };
        projects.forEach((p) => {
            const stage = p.progressUpdates[0]?.stage || 'Planning';
            if (stageCounts[stage] !== undefined) {
                stageCounts[stage]++;
            } else {
                stageCounts['Planning']++;
            }
        });

        const stageBreakdown = stages.map((stage) => ({
            stage,
            count: stageCounts[stage],
            pct: projectCount > 0 ? Math.round((stageCounts[stage] / projectCount) * 100) : 0,
        }));

        // 4. Recent projects (by latest progress update's reportDate)
        const recentUpdates = await this.prisma.progressUpdate.findMany({
            where: mdaId ? { project: { mdaId } } : {},
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

        // 5. Active issues & Trend
        const openCount = await this.prisma.issue.count({
            where: {
                status: 'Open',
                ...(mdaId ? { project: { mdaId } } : {}),
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
                    ...(mdaId ? { project: { mdaId } } : {}),
                },
            });
            trend.push({ label, value: count });
        }

        // 6. Top MDAs by project count
        const mdaProjectsCount = await this.prisma.project.groupBy({
            by: ['mdaId'],
            _count: {
                projectId: true,
            },
            where: mdaId ? { mdaId } : {},
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

        // 7. Pending approvals count (only meaningful/needed for PPIMU admin and Webmaster admin)
        const pendingApprovalsCount = await this.prisma.progressUpdate.count({
            where: {
                status: 'SUBMITTED',
                milestoneStatus: { not: 'Approved' },
                ...(mdaId ? { project: { mdaId } } : {}),
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
}
