import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Project, Role } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Readable } from 'stream';
const csvParser = require('csv-parser');

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
            isArchived: false,
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
        const whereClause: Prisma.ProjectWhereInput = { projectId: id, isArchived: false };
        
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

    async getArchivedByYear(year: number): Promise<Project[]> {
        const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59Z`);

        return this.prisma.project.findMany({
            where: {
                isArchived: true,
                startDate: {
                    gte: startOfYear,
                    lte: endOfYear
                }
            },
            include: { mda: true, progressUpdates: true, financeRecords: true }
        });
    }

    async importCsv(fileBuffer: Buffer): Promise<{ importedCount: number }> {
        const results: any[] = [];
        
        // Parse CSV
        await new Promise((resolve, reject) => {
            Readable.from(fileBuffer)
                .pipe(csvParser({ headers: ['mda', 'project', 'budget'], skipLines: 1 }))
                .on('data', (data: any) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error: any) => reject(error));
        });

        if (results.length === 0) {
            throw new BadRequestException('The CSV file is empty.');
        }

        const projectsToInsert: any[] = [];
        const mdaCache: Record<string, string> = {}; 

        let currentMdaId: string | null = null;

        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            
            const mdaNameRaw = row.mda ? row.mda.trim() : '';
            const projectName = row.project ? row.project.trim() : '';
            const budgetStr = row.budget ? row.budget.trim() : '';

            // This handles the user's specific format demarcation requirement
            if (mdaNameRaw && (!projectName || projectName === '-' || projectName === '')) {
                // This is a demarcation row
                let mdaId = mdaCache[mdaNameRaw];
                if (!mdaId) {
                    let mda = await this.prisma.mDA.findFirst({ where: { name: mdaNameRaw } });
                    if (!mda) {
                        mda = await this.prisma.mDA.create({ data: { name: mdaNameRaw } });
                    }
                    mdaCache[mdaNameRaw] = mda.id;
                    mdaId = mda.id;
                }
                currentMdaId = mdaId;
                continue;
            }

            // Normal row but might also contain the mdaName
            if (mdaNameRaw && !currentMdaId) {
                let mdaId = mdaCache[mdaNameRaw];
                if (!mdaId) {
                    let mda = await this.prisma.mDA.findFirst({ where: { name: mdaNameRaw } });
                    if (!mda) {
                        mda = await this.prisma.mDA.create({ data: { name: mdaNameRaw } });
                    }
                    mdaCache[mdaNameRaw] = mda.id;
                    mdaId = mda.id;
                }
                currentMdaId = mdaId;
            }

            if (!currentMdaId) {
                // If there's no project name and no MDA resolved, skip safely
                continue;
            }

            // Clean budget
            let budgetValue = 0;
            if (budgetStr && budgetStr !== '-') {
                const cleaned = budgetStr.replace(/["', ]/g, '');
                const parsed = parseFloat(cleaned);
                if (!isNaN(parsed)) {
                    budgetValue = parsed;
                }
            }

            projectsToInsert.push({
                mdaId: currentMdaId,
                title: projectName.length > 190 ? projectName.substring(0, 190) : projectName,
                sector: 'General', 
                lga: 'Statewide', 
                senatorialDistrict: 'Statewide', 
                locationText: 'Ondo State', 
                startDate: new Date('2026-01-01T00:00:00Z'),
                endDate: new Date('2026-12-31T00:00:00Z'),
                approvedBudget: budgetValue,
                fundingSource: 'State Budget 2026',
                status: 'Not Started',
                isArchived: false
            });
        }

        // Bulk insert using Prisma transaction
        await this.prisma.$transaction(
            projectsToInsert.map(projectData => this.prisma.project.create({ data: projectData }))
        );

        return { importedCount: projectsToInsert.length };
    }
}
