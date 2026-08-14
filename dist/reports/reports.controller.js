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
exports.ReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const reports_service_1 = require("./reports.service");
const swagger_1 = require("@nestjs/swagger");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getAnalytics(year, type, value) {
        const yearInt = parseInt(year, 10);
        const valueInt = parseInt(value, 10);
        if (!year || isNaN(yearInt)) {
            throw new common_1.BadRequestException('Year must be a valid number');
        }
        if (type !== 'monthly' && type !== 'quarterly') {
            throw new common_1.BadRequestException('Type must be either "monthly" or "quarterly"');
        }
        if (!value || isNaN(valueInt)) {
            throw new common_1.BadRequestException('Value must be a valid number');
        }
        if (type === 'monthly' && (valueInt < 1 || valueInt > 12)) {
            throw new common_1.BadRequestException('Monthly value must be between 1 and 12');
        }
        if (type === 'quarterly' && (valueInt < 1 || valueInt > 4)) {
            throw new common_1.BadRequestException('Quarterly value must be between 1 and 4');
        }
        return await this.reportsService.getReportAnalytics(yearInt, type, valueInt);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated analytical reports for a period' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, description: 'Year of the report' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: true, enum: ['monthly', 'quarterly'], description: 'Period type' }),
    (0, swagger_1.ApiQuery)({ name: 'value', required: true, description: 'Month (1-12) or Quarter (1-4)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytical reports payload' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid query parameters' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden / Unauthorized role' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAnalytics", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map