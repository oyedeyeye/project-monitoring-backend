import * as express from 'express';
import { PowerBiService } from './power-bi.service';
export declare class PowerBiController {
    private readonly powerBiService;
    constructor(powerBiService: PowerBiService);
    getTablesStructure(): {
        name: string;
        dbName: string;
        columns: {
            name: string;
            type: string;
            isRequired: boolean;
        }[];
    }[];
    getTableSample(tableName: string): Promise<any[]>;
    exportTableSample(tableName: string, res: express.Response): Promise<void>;
    getTableData(tableName: string, pageStr?: string, limitStr?: string): Promise<{
        data: Record<string, any>[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
