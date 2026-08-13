import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MDA } from '@prisma/client';

@Injectable()
export class MdasService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async create(data: Prisma.MDACreateInput): Promise<MDA> {
        const mda = await this.prisma.mDA.create({ data });
        await this.cacheManager.clear();
        return mda;
    }

    async findAll() {
        const mdas = await this.prisma.mDA.findMany({
            include: {
                projects: true,
                profiles: true,
            },
        });

        return mdas.map((mda) => {
            const usersCount = mda.profiles.length;
            const stalledCount = mda.projects.filter((p) => p.status === 'Stalled').length;
            const inProgressCount = mda.projects.filter((p) => p.status === 'Ongoing').length;
            const yetToBeginCount = mda.projects.filter((p) => p.status === 'Not Started').length;
            const completedCount = mda.projects.filter((p) => p.status === 'Completed').length;

            return {
                id: mda.id,
                name: mda.name,
                code: mda.code,
                usersCount,
                projectsStalled: stalledCount,
                projectsInProgress: inProgressCount,
                projectsYetToBegin: yetToBeginCount,
                projectsCompleted: completedCount,
                createdAt: mda.createdAt,
                updatedAt: mda.updatedAt,
            };
        });
    }

    async findOne(id: string): Promise<MDA | null> {
        return this.prisma.mDA.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: Prisma.MDAUpdateInput): Promise<MDA> {
        const mda = await this.prisma.mDA.update({
            where: { id },
            data,
        });
        await this.cacheManager.clear();
        return mda;
    }

    async remove(id: string): Promise<MDA> {
        const mda = await this.prisma.mDA.delete({
            where: { id },
        });
        await this.cacheManager.clear();
        return mda;
    }
}
