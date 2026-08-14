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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
    }
    async findByResetToken(token) {
        return this.prisma.user.findFirst({
            where: { resetPasswordToken: token },
            include: { profile: true },
        });
    }
    async create(data) {
        const user = await this.prisma.user.create({
            data,
            include: { profile: true },
        });
        await this.cacheManager.clear();
        return user;
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });
    }
    async findAll(params) {
        const page = params?.page || 1;
        const limit = params?.limit || 25;
        const skip = (page - 1) * limit;
        const role = params?.role;
        const where = role ? { profile: { role } } : {};
        const data = await this.prisma.user.findMany({
            where,
            skip,
            take: limit,
            include: {
                profile: {
                    include: {
                        mda: true,
                    },
                },
            },
        });
        const total = await this.prisma.user.count({ where });
        const mdaUpdates = await this.prisma.progressUpdate.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                project: {
                    select: { mdaId: true },
                },
            },
        });
        const latestUpdatesByMda = new Map();
        for (const update of mdaUpdates) {
            const mdaId = update.project?.mdaId;
            if (mdaId && !latestUpdatesByMda.has(mdaId)) {
                latestUpdatesByMda.set(mdaId, update.createdAt);
            }
        }
        const mappedData = data.map((user) => {
            let lastEditDate = user.profile?.updatedAt || user.updatedAt;
            if (user.profile?.mdaId) {
                const mdaLastUpdate = latestUpdatesByMda.get(user.profile.mdaId);
                if (mdaLastUpdate && mdaLastUpdate > lastEditDate) {
                    lastEditDate = mdaLastUpdate;
                }
            }
            return {
                ...user,
                lastEditActivityDate: lastEditDate,
            };
        });
        return {
            data: mappedData,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async update(id, data) {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            include: { profile: true },
        });
        await this.cacheManager.clear();
        return user;
    }
    async remove(id) {
        const user = await this.prisma.user.delete({
            where: { id },
            include: { profile: true },
        });
        await this.cacheManager.clear();
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map