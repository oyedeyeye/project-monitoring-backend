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
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let IssuesService = class IssuesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertCanAccess(id, user) {
        const where = { id };
        if (user.role === client_1.Role.MDA_OFFICER && user.mdaId) {
            where.project = { mdaId: user.mdaId };
        }
        const issue = await this.prisma.issue.findFirst({ where });
        if (!issue) {
            throw new common_1.NotFoundException('Issue not found or access denied');
        }
    }
    async findAll(user, projectId) {
        const where = {};
        if (projectId) {
            where.projectId = projectId;
        }
        if (user.role === client_1.Role.MDA_OFFICER && user.mdaId) {
            where.project = { ...(where.project || {}), mdaId: user.mdaId, isArchived: false };
        }
        else {
            where.project = { ...(where.project || {}), isArchived: false };
        }
        return this.prisma.issue.findMany({
            where,
            include: {
                project: {
                    include: {
                        mda: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data, user) {
        if (user.role === client_1.Role.MDA_OFFICER && user.mdaId) {
            const project = await this.prisma.project.findFirst({
                where: { projectId: data.projectId, mdaId: user.mdaId },
            });
            if (!project) {
                throw new common_1.NotFoundException('Project not found or access denied');
            }
        }
        if (data.logDate && typeof data.logDate === 'string') {
            data.logDate = new Date(data.logDate);
        }
        if (data.dueDate && typeof data.dueDate === 'string') {
            data.dueDate = new Date(data.dueDate);
        }
        else if (!data.dueDate) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            data.dueDate = nextWeek;
        }
        return this.prisma.issue.create({
            data,
        });
    }
    async update(id, data, user) {
        await this.assertCanAccess(id, user);
        const { projectId: _projectId, ...safeData } = data;
        return this.prisma.issue.update({
            where: { id },
            data: safeData,
        });
    }
    async remove(id, user) {
        await this.assertCanAccess(id, user);
        return this.prisma.issue.delete({
            where: { id },
        });
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IssuesService);
//# sourceMappingURL=issues.service.js.map