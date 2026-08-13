import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Issue, Role } from '@prisma/client';

type ActingUser = { role: Role; mdaId?: string };

@Injectable()
export class IssuesService {
    constructor(private prisma: PrismaService) {}

    /**
     * Assert the caller may act on this issue, following the idiom in
     * ProjectsService.findOne: the ownership predicate is part of the query and
     * a miss raises 404 rather than 403, so issue ids are not enumerable.
     *
     * Scoping matches findAll above (MDA_OFFICER only) so that PPIMU_ADMIN
     * behaviour is unchanged by this fix.
     */
    private async assertCanAccess(id: string, user: ActingUser): Promise<void> {
        const where: Prisma.IssueWhereInput = { id };

        if (user.role === Role.MDA_OFFICER && user.mdaId) {
            where.project = { mdaId: user.mdaId };
        }

        const issue = await this.prisma.issue.findFirst({ where });

        if (!issue) {
            throw new NotFoundException('Issue not found or access denied');
        }
    }

    async findAll(user: { role: Role; mdaId?: string }, projectId?: string): Promise<Issue[]> {
        const where: Prisma.IssueWhereInput = {};
        if (projectId) {
            where.projectId = projectId;
        }

        if (user.role === Role.MDA_OFFICER && user.mdaId) {
            where.project = { ...((where.project as any) || {}), mdaId: user.mdaId, isArchived: false };
        } else {
            where.project = { ...((where.project as any) || {}), isArchived: false };
        }

        return this.prisma.issue.findMany({
            where,
            include: {
                project: {
                    include: {
                        mda: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: Prisma.IssueUncheckedCreateInput, user: ActingUser): Promise<Issue> {
        // An officer may only log issues against projects in their own MDA.
        if (user.role === Role.MDA_OFFICER && user.mdaId) {
            const project = await this.prisma.project.findFirst({
                where: { projectId: data.projectId, mdaId: user.mdaId },
            });

            if (!project) {
                throw new NotFoundException('Project not found or access denied');
            }
        }

        // Ensure logDate and dueDate are handled properly
        if (data.logDate && typeof data.logDate === 'string') {
            data.logDate = new Date(data.logDate);
        }
        if (data.dueDate && typeof data.dueDate === 'string') {
            data.dueDate = new Date(data.dueDate);
        } else if (!data.dueDate) {
            // Default dueDate to 7 days from now if not provided
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            data.dueDate = nextWeek;
        }

        return this.prisma.issue.create({
            data,
        });
    }

    async update(id: string, data: Prisma.IssueUncheckedUpdateInput, user: ActingUser): Promise<Issue> {
        await this.assertCanAccess(id, user);

        // Reassigning projectId would move the issue into another MDA's project,
        // sidestepping the check above.
        const { projectId: _projectId, ...safeData } = data;

        return this.prisma.issue.update({
            where: { id },
            data: safeData,
        });
    }

    async remove(id: string, user: ActingUser): Promise<Issue> {
        await this.assertCanAccess(id, user);

        return this.prisma.issue.delete({
            where: { id },
        });
    }
}
