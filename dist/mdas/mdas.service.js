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
exports.MdasService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
let MdasService = class MdasService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async create(data) {
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
    async findOne(id) {
        return this.prisma.mDA.findUnique({
            where: { id },
        });
    }
    async update(id, data) {
        const mda = await this.prisma.mDA.update({
            where: { id },
            data,
        });
        await this.cacheManager.clear();
        return mda;
    }
    async remove(id) {
        const mda = await this.prisma.mDA.delete({
            where: { id },
        });
        await this.cacheManager.clear();
        return mda;
    }
};
exports.MdasService = MdasService;
exports.MdasService = MdasService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], MdasService);
//# sourceMappingURL=mdas.service.js.map