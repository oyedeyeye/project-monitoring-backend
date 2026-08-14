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
exports.IssuesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const issues_service_1 = require("./issues.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let IssuesController = class IssuesController {
    issuesService;
    constructor(issuesService) {
        this.issuesService = issuesService;
    }
    create(req, createIssueDto) {
        return this.issuesService.create(createIssueDto, req.user);
    }
    findAll(req, projectId) {
        return this.issuesService.findAll(req.user, projectId);
    }
    update(req, id, updateIssueDto) {
        return this.issuesService.update(id, updateIssueDto, req.user);
    }
    resolve(req, id) {
        return this.issuesService.update(id, { status: 'Resolved' }, req.user);
    }
    remove(req, id) {
        return this.issuesService.remove(id, req.user);
    }
};
exports.IssuesController = IssuesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN, client_1.Role.MDA_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new issue' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "create", null);
__decorate([
    openapi.ApiQuery({ name: "projectId", required: false }),
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN, client_1.Role.MDA_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all issues, optionally filtered by projectId' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN, client_1.Role.MDA_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Update an issue' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN, client_1.Role.MDA_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve an issue' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "resolve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.PPIMU_ADMIN, client_1.Role.WEBMASTER_ADMIN, client_1.Role.MDA_OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an issue' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "remove", null);
exports.IssuesController = IssuesController = __decorate([
    (0, swagger_1.ApiTags)('issues'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('issues'),
    __metadata("design:paramtypes", [issues_service_1.IssuesService])
], IssuesController);
//# sourceMappingURL=issues.controller.js.map