import { MdasService } from './mdas.service';
import { Prisma } from '@prisma/client';
export declare class MdasController {
    private readonly mdasService;
    constructor(mdasService: MdasService);
    create(createMdaDto: Prisma.MDACreateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
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
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    } | null>;
    update(id: string, updateMdaDto: Prisma.MDAUpdateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string | null;
    }>;
}
