import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.ProjectCreateInput): Promise<Project> {
        return this.prisma.project.create({ data });
    }

    async findAll(params?: { mdaId?: string; page?: number; limit?: number }): Promise<{ data: Project[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
        const page = params?.page || 1;
        const limit = params?.limit || 25;
        const skip = (page - 1) * limit;
        const mdaId = params?.mdaId;

        const where: Prisma.ProjectWhereInput = mdaId ? { mdaId } : {};

        const data = await this.prisma.project.findMany({
            where,
            skip,
            take: limit,
            include: { mda: true, progressUpdates: true }
        });

        const total = await this.prisma.project.count({ where });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async findOne(id: string): Promise<Project | null> {
        return this.prisma.project.findUnique({
            where: { id },
            include: { mda: true, progressUpdates: true }
        });
    }

    async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
        return this.prisma.project.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<Project> {
        return this.prisma.project.delete({
            where: { id },
        });
    }
}
