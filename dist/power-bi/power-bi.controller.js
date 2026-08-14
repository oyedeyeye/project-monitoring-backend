"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerBiController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const express = __importStar(require("express"));
const power_bi_service_1 = require("./power-bi.service");
const swagger_1 = require("@nestjs/swagger");
const powerbi_api_key_guard_1 = require("../auth/guards/powerbi-api-key.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const MAX_PAGE_SIZE = 5000;
let PowerBiController = class PowerBiController {
    powerBiService;
    constructor(powerBiService) {
        this.powerBiService = powerBiService;
    }
    getTablesStructure() {
        return this.powerBiService.getTablesStructure();
    }
    getTableSample(tableName) {
        return this.powerBiService.getTableSample(tableName);
    }
    async exportTableSample(tableName, res) {
        const csvContent = await this.powerBiService.generateCsv(tableName);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${tableName.toLowerCase()}-sample.csv"`);
        res.status(200).send(csvContent);
    }
    getTableData(tableName, pageStr, limitStr) {
        const parsedPage = parseInt(pageStr ?? '', 10);
        const parsedLimit = parseInt(limitStr ?? '', 10);
        const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
        let limit = Number.isFinite(parsedLimit) && parsedLimit >= 1 ? parsedLimit : 1000;
        if (limit > MAX_PAGE_SIZE)
            limit = MAX_PAGE_SIZE;
        return this.powerBiService.getTableData(tableName, page, limit);
    }
};
exports.PowerBiController = PowerBiController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Get)('tables'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of available tables and their schemas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Table structures' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PowerBiController.prototype, "getTablesStructure", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Get)('tables/:tableName/sample'),
    (0, swagger_1.ApiOperation)({ summary: 'Get up to 10 random sample records for a table' }),
    (0, swagger_1.ApiParam)({ name: 'tableName', description: 'The model or database table name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sample records array' }),
    __param(0, (0, common_1.Param)('tableName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PowerBiController.prototype, "getTableSample", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN),
    (0, common_1.Get)('tables/:tableName/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Download 10 random sample records for a table as a CSV file' }),
    (0, swagger_1.ApiParam)({ name: 'tableName', description: 'The model or database table name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Downloadable CSV file' }),
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PowerBiController.prototype, "exportTableSample", null);
__decorate([
    (0, common_1.UseGuards)(powerbi_api_key_guard_1.PowerBiApiKeyGuard),
    (0, common_1.Get)('tables/:tableName/data'),
    (0, swagger_1.ApiOperation)({ summary: 'Paginated data ingestion endpoint for Power BI' }),
    (0, swagger_1.ApiParam)({ name: 'tableName', description: 'The model or database table name' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 1000)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated JSON data for ingestion' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing or Invalid API Key' }),
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PowerBiController.prototype, "getTableData", null);
exports.PowerBiController = PowerBiController = __decorate([
    (0, swagger_1.ApiTags)('power-bi'),
    (0, common_1.Controller)('power-bi'),
    __metadata("design:paramtypes", [power_bi_service_1.PowerBiService])
], PowerBiController);
//# sourceMappingURL=power-bi.controller.js.map