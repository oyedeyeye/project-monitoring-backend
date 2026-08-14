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
exports.ProgressUpdatesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const progress_updates_service_1 = require("./progress-updates.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let ProgressUpdatesController = class ProgressUpdatesController {
    updatesService;
    constructor(updatesService) {
        this.updatesService = updatesService;
    }
    create(createUpdateDto) {
        return this.updatesService.create(createUpdateDto);
    }
    findAll(req, page, limit, projectId) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 25;
        const options = { page: pageNum, limit: limitNum, projectId };
        if (req.user.role === client_1.Role.WEBMASTER_ADMIN) {
            return this.updatesService.findAll(options);
        }
        if (req.user.role === client_1.Role.PPIMU_ADMIN) {
            if (projectId) {
                return this.updatesService.findAll(options);
            }
            return this.updatesService.findAllSubmitted(options);
        }
        return this.updatesService.findAllByMda(req.user.mdaId, options);
    }
    findOne(id) {
        return this.updatesService.findOne(id);
    }
    update(id, updateDto) {
        return this.updatesService.update(id, updateDto);
    }
    approve(id) {
        return this.updatesService.update(id, { milestoneStatus: 'Approved' });
    }
    reject(id) {
        return this.updatesService.update(id, { milestoneStatus: 'Changes Required' });
    }
    remove(id) {
        return this.updatesService.remove(id);
    }
};
exports.ProgressUpdatesController = ProgressUpdatesController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MDA_OFFICER, client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "create", null);
__decorate([
    openapi.ApiQuery({ name: "page", required: false }),
    openapi.ApiQuery({ name: "limit", required: false }),
    openapi.ApiQuery({ name: "projectId", required: false }),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MDA_OFFICER, client_1.Role.WEBMASTER_ADMIN, client_1.Role.PPIMU_ADMIN),
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Put)(':id/approve'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "approve", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Put)(':id/reject'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "reject", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProgressUpdatesController.prototype, "remove", null);
exports.ProgressUpdatesController = ProgressUpdatesController = __decorate([
    (0, swagger_1.ApiTags)('progress-updates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('progress-updates'),
    __metadata("design:paramtypes", [progress_updates_service_1.ProgressUpdatesService])
], ProgressUpdatesController);
//# sourceMappingURL=progress-updates.controller.js.map