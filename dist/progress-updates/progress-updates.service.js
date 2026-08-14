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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressUpdatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let ProgressUpdatesService = class ProgressUpdatesService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async checkAndBroadcast(record) {
        if (record.status === client_1.ReportStatus.SUBMITTED) {
            try {
                const fullUpdate = await this.prisma.progressUpdate.findUnique({
                    where: { id: record.id },
                    include: {
                        project: {
                            include: {
                                mda: true,
                            },
                        },
                    },
                });
                if (fullUpdate && fullUpdate.project && fullUpdate.project.mda) {
                    this.notificationsService.emitNewUpdateSubmitted({
                        id: fullUpdate.id,
                        projectId: fullUpdate.projectId,
                        projectTitle: fullUpdate.project.title,
                        mdaName: fullUpdate.project.mda.name,
                        submittedAt: fullUpdate.reportDate.toISOString(),
                        physicalProgressPct: fullUpdate.physicalProgressPct,
                    });
                }
            }
            catch (err) {
                console.error('Failed to broadcast submitted progress update notification:', err);
            }
        }
    }
    async create(data) {
        const record = await this.prisma.progressUpdate.create({ data: data });
        await this.checkAndBroadcast(record);
        return record;
    }
    async findAllByMda(mdaId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 25;
        const skip = (page - 1) * limit;
        const where = {
            project: { mdaId, isArchived: false }
        };
        if (options?.projectId) {
            where.projectId = options.projectId;
        }
        const data = await this.prisma.progressUpdate.findMany({
            where,
            include: { project: true, issues: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const total = await this.prisma.progressUpdate.count({ where });
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
    async findAllSubmitted(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 25;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.ReportStatus.SUBMITTED,
            project: { isArchived: false }
        };
        if (options?.projectId) {
            where.projectId = options.projectId;
        }
        const data = await this.prisma.progressUpdate.findMany({
            where,
            include: { project: true, issues: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const total = await this.prisma.progressUpdate.count({ where });
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
    async findAll(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 25;
        const skip = (page - 1) * limit;
        const where = {
            project: { isArchived: false }
        };
        if (options?.projectId) {
            where.projectId = options.projectId;
        }
        const data = await this.prisma.progressUpdate.findMany({
            where,
            include: { project: true, issues: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const total = await this.prisma.progressUpdate.count({ where });
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
    async findOne(id) {
        return this.prisma.progressUpdate.findUnique({
            where: { id },
            include: { project: true, issues: true }
        });
    }
    async update(id, data) {
        const record = await this.prisma.progressUpdate.update({
            where: { id },
            data: data
        });
        await this.checkAndBroadcast(record);
        return record;
    }
    async remove(id) {
        return this.prisma.progressUpdate.delete({
            where: { id },
        });
    }
};
exports.ProgressUpdatesService = ProgressUpdatesService;
exports.ProgressUpdatesService = ProgressUpdatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ProgressUpdatesService);
//# sourceMappingURL=progress-updates.service.js.map