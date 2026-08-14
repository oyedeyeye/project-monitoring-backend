"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const stream_1 = require("stream");
const csvParser = require('csv-parser');
let ProjectsService = class ProjectsService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async create(data) {
        const project = await this.prisma.project.create({ data: data });
        await this.cacheManager.clear();
        return project;
    }
    async findAll(params) {
        const page = params?.page || 1;
        const limit = params?.limit || 25;
        const skip = (page - 1) * limit;
        const mdaId = params?.mdaId;
        const status = params?.status;
        const lga = params?.lga;
        const where = {
            ...(mdaId ? { mdaId } : {}),
            ...(status ? { status } : {}),
            ...(lga ? { lga: { contains: lga } } : {}),
            isArchived: false,
        };
        const data = await this.prisma.project.findMany({
            where,
            skip,
            take: limit,
            include: { mda: true, progressUpdates: true },
        });
        const total = await this.prisma.project.count({ where });
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
    async findOne(id, user) {
        const whereClause = {
            projectId: id,
            isArchived: false,
        };
        if (user.role !== client_1.Role.WEBMASTER_ADMIN) {
            whereClause.mdaId = user.mdaId;
        }
        const project = await this.prisma.project.findFirst({
            where: whereClause,
            include: { mda: true, progressUpdates: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found or access denied');
        }
        return project;
    }
    async update(id, data) {
        const project = await this.prisma.project.update({
            where: { projectId: id },
            data: data,
        });
        await this.cacheManager.clear();
        return project;
    }
    async remove(id) {
        const project = await this.prisma.project.delete({
            where: { projectId: id },
        });
        await this.cacheManager.clear();
        return project;
    }
    async getArchivedByYear(year) {
        const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59Z`);
        return this.prisma.project.findMany({
            where: {
                isArchived: true,
                startDate: {
                    gte: startOfYear,
                    lte: endOfYear,
                },
            },
            include: { mda: true, progressUpdates: true, financeRecords: true },
        });
    }
    async importCsv(fileBuffer) {
        const results = [];
        await new Promise((resolve, reject) => {
            stream_1.Readable.from(fileBuffer)
                .pipe(csvParser({ headers: ['mda', 'project', 'budget'], skipLines: 1 }))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
        if (results.length === 0) {
            throw new common_1.BadRequestException('The CSV file is empty.');
        }
        const projectsToInsert = [];
        const mdaCache = {};
        let currentMdaId = null;
        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const mdaNameRaw = row.mda ? row.mda.trim() : '';
            const projectName = row.project ? row.project.trim() : '';
            const budgetStr = row.budget ? row.budget.trim() : '';
            if (mdaNameRaw &&
                (!projectName || projectName === '-' || projectName === '')) {
                let mdaId = mdaCache[mdaNameRaw];
                if (!mdaId) {
                    let mda = await this.prisma.mDA.findFirst({
                        where: { name: mdaNameRaw },
                    });
                    if (!mda) {
                        mda = await this.prisma.mDA.create({ data: { name: mdaNameRaw } });
                    }
                    mdaCache[mdaNameRaw] = mda.id;
                    mdaId = mda.id;
                }
                currentMdaId = mdaId;
                continue;
            }
            if (mdaNameRaw && !currentMdaId) {
                let mdaId = mdaCache[mdaNameRaw];
                if (!mdaId) {
                    let mda = await this.prisma.mDA.findFirst({
                        where: { name: mdaNameRaw },
                    });
                    if (!mda) {
                        mda = await this.prisma.mDA.create({ data: { name: mdaNameRaw } });
                    }
                    mdaCache[mdaNameRaw] = mda.id;
                    mdaId = mda.id;
                }
                currentMdaId = mdaId;
            }
            if (!currentMdaId) {
                continue;
            }
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
                title: projectName.length > 190
                    ? projectName.substring(0, 190)
                    : projectName,
                sector: 'General',
                lga: 'Statewide',
                senatorialDistrict: 'Statewide',
                locationText: 'Ondo State',
                startDate: new Date('2026-01-01T00:00:00Z'),
                endDate: new Date('2026-12-31T00:00:00Z'),
                approvedBudget: budgetValue,
                fundingSource: 'State Budget 2026',
                status: 'Not Started',
                isArchived: false,
            });
        }
        await this.prisma.$transaction(projectsToInsert.map((projectData) => this.prisma.project.create({ data: projectData })));
        await this.cacheManager.clear();
        return { importedCount: projectsToInsert.length };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map