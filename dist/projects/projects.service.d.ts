import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Project } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    create(data: CreateProjectDto): Promise<Project>;
    findAll(params?: {
        mdaId?: string;
        status?: string;
        lga?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Project[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: any): Promise<Project>;
    update(id: string, data: UpdateProjectDto): Promise<Project>;
    remove(id: string): Promise<Project>;
    getArchivedByYear(year: number): Promise<Project[]>;
    importCsv(fileBuffer: Buffer): Promise<{
        importedCount: number;
    }>;
}
