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
exports.PowerBiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PowerBiService = class PowerBiService {
    prisma;
    allowedModels = ['MDA', 'Project', 'ProgressUpdate', 'FinanceRecord', 'Issue', 'UserProfile'];
    sensitiveKeywords = ['password', 'key', 'token', 'secret', 'hash'];
    constructor(prisma) {
        this.prisma = prisma;
    }
    isSensitiveField(fieldName) {
        const lower = fieldName.toLowerCase();
        return this.sensitiveKeywords.some(keyword => lower.includes(keyword));
    }
    getTablesStructure() {
        const models = client_1.Prisma.dmmf.datamodel.models;
        return models
            .filter(model => this.allowedModels.includes(model.name))
            .map(model => {
            const columns = model.fields
                .filter(field => field.kind === 'scalar' && !this.isSensitiveField(field.name))
                .map(field => ({
                name: field.name,
                type: field.type,
                isRequired: field.isRequired !== undefined ? field.isRequired : true,
            }));
            return {
                name: model.name,
                dbName: model.dbName || model.name,
                columns,
            };
        });
    }
    getValidatedModel(tableName) {
        const models = client_1.Prisma.dmmf.datamodel.models;
        const model = models.find(m => m.name.toLowerCase() === tableName.toLowerCase() ||
            (m.dbName && m.dbName.toLowerCase() === tableName.toLowerCase()));
        if (!model || !this.allowedModels.includes(model.name)) {
            throw new common_1.NotFoundException(`Table '${tableName}' not found or access is restricted.`);
        }
        return model;
    }
    async getTableSample(tableName) {
        const model = this.getValidatedModel(tableName);
        const dbTableName = model.dbName || model.name;
        const allowedFields = model.fields
            .filter(field => field.kind === 'scalar' && !this.isSensitiveField(field.name));
        if (allowedFields.length === 0) {
            return [];
        }
        const selectClause = allowedFields.map(field => {
            const dbColumn = field.dbName || field.name;
            return `\`${dbColumn}\` AS \`${field.name}\``;
        }).join(', ');
        const query = `SELECT ${selectClause} FROM \`${dbTableName}\` ORDER BY RAND() LIMIT 10`;
        const rawResults = await this.prisma.$queryRawUnsafe(query);
        return rawResults.map(row => {
            const serializedRow = {};
            for (const field of allowedFields) {
                const col = field.name;
                const val = row[col];
                if (val !== undefined) {
                    if (val instanceof client_1.Prisma.Decimal) {
                        serializedRow[col] = Number(val);
                    }
                    else if (typeof val === 'bigint') {
                        serializedRow[col] = val.toString();
                    }
                    else {
                        serializedRow[col] = val;
                    }
                }
                else {
                    serializedRow[col] = null;
                }
            }
            return serializedRow;
        });
    }
    async generateCsv(tableName) {
        const data = await this.getTableSample(tableName);
        if (data.length === 0) {
            const model = this.getValidatedModel(tableName);
            const columns = model.fields
                .filter(field => field.kind === 'scalar' && !this.isSensitiveField(field.name))
                .map(field => field.name);
            return columns.join(',');
        }
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                const valStr = val === null || val === undefined ? '' : String(val);
                const escaped = valStr.replace(/"/g, '""');
                if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('\r') || escaped.includes('"')) {
                    return `"${escaped}"`;
                }
                return escaped;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    }
    async getTableData(tableName, page = 1, limit = 1000) {
        const model = this.getValidatedModel(tableName);
        const dbTableName = model.dbName || model.name;
        const allowedFields = model.fields
            .filter(field => field.kind === 'scalar' && !this.isSensitiveField(field.name));
        if (allowedFields.length === 0) {
            return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
        }
        const selectClause = allowedFields.map(field => {
            const dbColumn = field.dbName || field.name;
            return `\`${dbColumn}\` AS \`${field.name}\``;
        }).join(', ');
        const offset = (page - 1) * limit;
        const countQuery = `SELECT COUNT(*) as total FROM \`${dbTableName}\``;
        const countResult = await this.prisma.$queryRawUnsafe(countQuery);
        const total = Number(countResult[0].total || 0);
        const dataQuery = `SELECT ${selectClause} FROM \`${dbTableName}\` LIMIT ${limit} OFFSET ${offset}`;
        const rawResults = await this.prisma.$queryRawUnsafe(dataQuery);
        const data = rawResults.map(row => {
            const serializedRow = {};
            for (const field of allowedFields) {
                const col = field.name;
                const val = row[col];
                if (val !== undefined) {
                    if (val instanceof client_1.Prisma.Decimal) {
                        serializedRow[col] = Number(val);
                    }
                    else if (typeof val === 'bigint') {
                        serializedRow[col] = val.toString();
                    }
                    else {
                        serializedRow[col] = val;
                    }
                }
                else {
                    serializedRow[col] = null;
                }
            }
            return serializedRow;
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
};
exports.PowerBiService = PowerBiService;
exports.PowerBiService = PowerBiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PowerBiService);
//# sourceMappingURL=power-bi.service.js.map