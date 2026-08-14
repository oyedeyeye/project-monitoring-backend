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
exports.ProjectsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const user_scoped_cache_interceptor_1 = require("../common/interceptors/user-scoped-cache.interceptor");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    create(createProjectDto) {
        return this.projectsService.create(createProjectDto);
    }
    async getImportTemplate() {
        const headers = 'mda,project,budget';
        const sampleRow1 = '"TEACHING SERVICE COMMISSION",,';
        const sampleRow2 = '"TEACHING SERVICE COMMISSION","Purchase of Laptops",5000000';
        return `${headers}\n${sampleRow1}\n${sampleRow2}`;
    }
    async importCsv(file) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required');
        }
        return this.projectsService.importCsv(file.buffer);
    }
    findAll(req, mdaId, status, pageStr, limitStr, lga) {
        let page = pageStr ? parseInt(pageStr, 10) : 1;
        let limit = limitStr ? parseInt(limitStr, 10) : 25;
        if (limit > 100)
            limit = 100;
        if (page < 1)
            page = 1;
        const userRole = req.user.role;
        const targetMdaId = userRole === client_1.Role.WEBMASTER_ADMIN ? mdaId : req.user.mdaId;
        return this.projectsService.findAll({
            mdaId: targetMdaId,
            status,
            lga,
            page,
            limit,
        });
    }
    async getArchivedByYear(year) {
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum)) {
            throw new common_1.BadRequestException('Invalid year format');
        }
        return this.projectsService.getArchivedByYear(yearNum);
    }
    findOne(id, req) {
        return this.projectsService.findOne(id, req.user);
    }
    update(id, updateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }
    remove(id) {
        return this.projectsService.remove(id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                sector: { type: 'string' },
                mdaId: { type: 'string' },
                status: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Project successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden / Invalid Role' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Get)('import/template'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="projects_import_template.csv"'),
    (0, swagger_1.ApiOperation)({ summary: 'Download CSV template for project import' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CSV template content' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getImportTemplate", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Post)('import/csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Import projects from CSV' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Projects successfully imported' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid CSV format or missing fields',
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "importCsv", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve projects' }),
    (0, swagger_1.ApiQuery)({
        name: 'mdaId',
        required: false,
        description: 'Filter by MDA ID (Admin only)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by project status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lga',
        required: false,
        description: 'Filter by local government area (LGA)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Items per page (default: 25)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of projects based on user role',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized / Missing token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('mdaId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('lga')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('archive/:year'),
    (0, swagger_1.ApiOperation)({ summary: 'Get archived projects by budget year' }),
    (0, swagger_1.ApiParam)({ name: 'year', description: 'Budget Year (e.g. 2025)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archived projects returned' }),
    __param(0, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getArchivedByYear", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project by ID' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Patch)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a project' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { title: { type: 'string' }, status: { type: 'string' } },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Delete)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', description: 'Project UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "remove", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(user_scoped_cache_interceptor_1.UserScopedCacheInterceptor),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map