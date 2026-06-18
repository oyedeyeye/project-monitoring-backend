import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Project, Role } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateProjectDto): Promise<Project> {
        return this.prisma.project.create({ data: data as any });
    }

    async findAll(params?: { mdaId?: string; status?: string; lga?: string; page?: number; limit?: number }): Promise<{ data: Project[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
        const page = params?.page || 1;
        const limit = params?.limit || 25;
        const skip = (page - 1) * limit;
        const mdaId = params?.mdaId;
        const status = params?.status;
        const lga = params?.lga;

        const where: Prisma.ProjectWhereInput = {
            ...(mdaId ? { mdaId } : {}),
            ...(status ? { status } : {}),
            ...(lga ? { lga: { contains: lga } } : {}),
        };

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

    async findOne(id: string, user: any): Promise<Project> {
        const whereClause: Prisma.ProjectWhereInput = { projectId: id };
        
        if (user.role !== Role.WEBMASTER_ADMIN) {
            whereClause.mdaId = user.mdaId;
        }

        const project = await this.prisma.project.findFirst({
            where: whereClause,
            include: { mda: true, progressUpdates: true }
        });

        if (!project) {
            throw new NotFoundException('Project not found or access denied');
        }

        return project;
    }

    async update(id: string, data: UpdateProjectDto): Promise<Project> {
        return this.prisma.project.update({
            where: { projectId: id },
            data: data as any,
        });
    }

    async remove(id: string): Promise<Project> {
        return this.prisma.project.delete({
            where: { projectId: id },
        });
    }
}
