import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PowerBiService {
    // Whitelist of models allowed for Power BI export
    private readonly allowedModels = ['MDA', 'Project', 'ProgressUpdate', 'FinanceRecord', 'Issue', 'UserProfile'];

    // Keywords of fields to scrub/exclude from schema and data queries (case-insensitive)
    private readonly sensitiveKeywords = ['password', 'key', 'token', 'secret', 'hash'];

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Helper to verify if a field name is sensitive
     */
    private isSensitiveField(fieldName: string): boolean {
        const lower = fieldName.toLowerCase();
        return this.sensitiveKeywords.some(keyword => lower.includes(keyword));
    }

    /**
     * Retrieve all whitelisted models and their schema structure
     */
    getTablesStructure() {
        const models = Prisma.dmmf.datamodel.models;
        
        return models
            .filter(model => this.allowedModels.includes(model.name))
            .map(model => {
                const columns = model.fields
                    // Include only scalar fields (columns in the actual DB table)
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

    /**
     * Validates and retrieves the schema metadata for a specific table
     */
    private getValidatedModel(tableName: string) {
        const models = Prisma.dmmf.datamodel.models;
        const model = models.find(
            m => m.name.toLowerCase() === tableName.toLowerCase() || 
                 (m.dbName && m.dbName.toLowerCase() === tableName.toLowerCase())
        );

        if (!model || !this.allowedModels.includes(model.name)) {
            throw new NotFoundException(`Table '${tableName}' not found or access is restricted.`);
        }

        return model;
    }

    /**
     * Get up to 10 random records from a whitelisted table
     */
    async getTableSample(tableName: string): Promise<any[]> {
        const model = this.getValidatedModel(tableName);
        const dbTableName = model.dbName || model.name;

        // Extract and validate allowed columns (no sensitive fields, scalar only)
        const allowedFields = model.fields
            .filter(field => field.kind === 'scalar' && !this.isSensitiveField(field.name));

        if (allowedFields.length === 0) {
            return [];
        }

        // To prevent any SQL injection, wrap columns in backticks (MySQL format).
        // If the field has a dbName (e.g. @map), use it, but alias it to field.name.
        const selectClause = allowedFields.map(field => {
            const dbColumn = field.dbName || field.name;
            return `\`${dbColumn}\` AS \`${field.name}\``;
        }).join(', ');
        
        // Execute raw query using safe inputs derived from DMMF metadata
        const query = `SELECT ${selectClause} FROM \`${dbTableName}\` ORDER BY RAND() LIMIT 10`;
        const rawResults: any[] = await this.prisma.$queryRawUnsafe(query);

        // Serialize fields (e.g. convert Decimals or BigInts to numbers/strings)
        return rawResults.map(row => {
            const serializedRow: Record<string, any> = {};
            for (const field of allowedFields) {
                const col = field.name;
                const val = row[col];
                // Include nulls explicitly
                if (val !== undefined) {
                    if (val instanceof Prisma.Decimal) {
                        serializedRow[col] = Number(val);
                    } else if (typeof val === 'bigint') {
                        serializedRow[col] = val.toString();
                    } else {
                        serializedRow[col] = val;
                    }
                } else {
                    serializedRow[col] = null;
                }
            }
            return serializedRow;
        });
    }

    /**
     * Converts JSON data of a table sample into a downloadable CSV string
     */
    async generateCsv(tableName: string): Promise<string> {
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
}
