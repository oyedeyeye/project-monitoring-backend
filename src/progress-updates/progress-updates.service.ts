import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProgressUpdate, ReportStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProgressUpdatesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    private async checkAndBroadcast(record: ProgressUpdate) {
        if (record.status === ReportStatus.SUBMITTED) {
            try {
                const fullUpdate = await this.prisma.progressUpdate.findUnique({
                    where: { id: record.id },
                    include: {
                        project: {
                            include: {
                                mda: true,
                            },
                        },
                    },
                });
                if (fullUpdate && fullUpdate.project && fullUpdate.project.mda) {
                    this.notificationsService.emitNewUpdateSubmitted({
                        id: fullUpdate.id,
                        projectId: fullUpdate.projectId,
                        projectTitle: fullUpdate.project.title,
                        mdaName: fullUpdate.project.mda.name,
                        submittedAt: fullUpdate.reportDate.toISOString(),
                        physicalProgressPct: fullUpdate.physicalProgressPct,
                    });
                }
            } catch (err) {
                console.error('Failed to broadcast submitted progress update notification:', err);
            }
        }
    }

    async create(data: Prisma.ProgressUpdateUncheckedCreateInput): Promise<ProgressUpdate> {
        const record = await this.prisma.progressUpdate.create({ data: data as any });
        await this.checkAndBroadcast(record);
        return record;
    }

    async findAllByMda(mdaId: string, options?: { page?: number; limit?: number; projectId?: string }) {
        const page = options?.page || 1;
        const limit = options?.limit || 25;
        const skip = (page - 1) * limit;

        const where: Prisma.ProgressUpdateWhereInput = {
            project: { mdaId }
        };
        if (options?.projectId) {
            where.projectId = options.projectId;
        }

        const data = await this.prisma.progressUpdate.findMany({
            where,
            include: { project: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await this.prisma.progressUpdate.count({ where });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findAllSubmitted(options?: { page?: number; limit?: number; projectId?: string }) {
        const page = options?.page || 1;
        const limit = options?.limit || 25;
        const skip = (page - 1) * limit;

        const where: Prisma.ProgressUpdateWhereInput = {
            status: ReportStatus.SUBMITTED
        };
        if (options?.projectId) {
            where.projectId = options.projectId;
        }

        const data = await this.prisma.progressUpdate.findMany({
            where,
            include: { project: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await this.prisma.progressUpdate.count({ where });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findAll(options?: { page?: number; limit?: number; projectId?: string }) {
        const page = options?.page || 1;
        const limit = options?.limit || 25;
        const skip = (page - 1) * limit;

        const where: Prisma.ProgressUpdateWhereInput = {};
        if (options?.projectId) {
            where.projectId = options.projectId;
        }

        const data = await this.prisma.progressUpdate.findMany({
            where,
            include: { project: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await this.prisma.progressUpdate.count({ where });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<ProgressUpdate | null> {
        return this.prisma.progressUpdate.findUnique({
            where: { id },
            include: { project: true }
        });
    }

    async update(id: string, data: Prisma.ProgressUpdateUncheckedUpdateInput): Promise<ProgressUpdate> {
        const record = await this.prisma.progressUpdate.update({
            where: { id },
            data: data as any
        });
        await this.checkAndBroadcast(record);
        return record;
    }

    async remove(id: string): Promise<ProgressUpdate> {
        return this.prisma.progressUpdate.delete({
            where: { id },
        });
    }
}
