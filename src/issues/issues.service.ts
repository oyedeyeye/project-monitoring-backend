import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Issue } from '@prisma/client';

@Injectable()
export class IssuesService {
    constructor(private prisma: PrismaService) {}

    async findAll(projectId?: string): Promise<Issue[]> {
        const where: Prisma.IssueWhereInput = {};
        if (projectId) {
            where.projectId = projectId;
        }

        return this.prisma.issue.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: Prisma.IssueUncheckedCreateInput): Promise<Issue> {
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

    async update(id: string, data: Prisma.IssueUncheckedUpdateInput): Promise<Issue> {
        return this.prisma.issue.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<Issue> {
        return this.prisma.issue.delete({
            where: { id },
        });
    }
}
