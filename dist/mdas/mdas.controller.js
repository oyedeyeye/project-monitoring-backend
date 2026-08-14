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
exports.MdasController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const mdas_service_1 = require("./mdas.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_scoped_cache_interceptor_1 = require("../common/interceptors/user-scoped-cache.interceptor");
let MdasController = class MdasController {
    mdasService;
    constructor(mdasService) {
        this.mdasService = mdasService;
    }
    create(createMdaDto) {
        return this.mdasService.create(createMdaDto);
    }
    findAll() {
        return this.mdasService.findAll();
    }
    findOne(id) {
        return this.mdasService.findOne(id);
    }
    update(id, updateMdaDto) {
        return this.mdasService.update(id, updateMdaDto);
    }
    remove(id) {
        return this.mdasService.remove(id);
    }
};
exports.MdasController = MdasController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MdasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MdasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MdasController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MdasController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MdasController.prototype, "remove", null);
exports.MdasController = MdasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(user_scoped_cache_interceptor_1.UserScopedCacheInterceptor),
    (0, common_1.Controller)('mdas'),
    __metadata("design:paramtypes", [mdas_service_1.MdasService])
], MdasController);
//# sourceMappingURL=mdas.controller.js.map