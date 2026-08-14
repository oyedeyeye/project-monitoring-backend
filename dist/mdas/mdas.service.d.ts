import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MDA } from '@prisma/client';
export declare class MdasService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    create(data: Prisma.MDACreateInput): Promise<MDA>;
    findAll(): Promise<{
        id: string;
        name: string;
        code: string | null;
        usersCount: number;
        projectsStalled: number;
        projectsInProgress: number;
        projectsYetToBegin: number;
        projectsCompleted: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<MDA | null>;
    update(id: string, data: Prisma.MDAUpdateInput): Promise<MDA>;
    remove(id: string): Promise<MDA>;
}
