import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PowerBiService {
    private readonly prisma;
    private readonly allowedModels;
    private readonly sensitiveKeywords;
    constructor(prisma: PrismaService);
    private isSensitiveField;
    getTablesStructure(): {
        name: string;
        dbName: string;
        columns: {
            name: string;
            type: string;
            isRequired: Prisma.DMMF.ReadonlyDeep<Prisma.DMMF.ReadonlyDeep<Prisma.DMMF.ReadonlyDeep<boolean>>>;
        }[];
    }[];
    private getValidatedModel;
    getTableSample(tableName: string): Promise<any[]>;
    generateCsv(tableName: string): Promise<string>;
    getTableData(tableName: string, page?: number, limit?: number): Promise<{
        data: Record<string, any>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
