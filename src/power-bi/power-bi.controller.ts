import { Controller, Get, Param, Res } from '@nestjs/common';
import * as express from 'express';
import { PowerBiService } from './power-bi.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('power-bi')
@Controller('power-bi')
export class PowerBiController {
    constructor(private readonly powerBiService: PowerBiService) {}

    @Get('tables')
    @ApiOperation({ summary: 'Get list of available tables and their schemas' })
    @ApiResponse({ status: 200, description: 'Table structures' })
    getTablesStructure() {
        return this.powerBiService.getTablesStructure();
    }

    @Get('tables/:tableName/sample')
    @ApiOperation({ summary: 'Get up to 10 random sample records for a table' })
    @ApiParam({ name: 'tableName', description: 'The model or database table name' })
    @ApiResponse({ status: 200, description: 'Sample records array' })
    getTableSample(@Param('tableName') tableName: string) {
        return this.powerBiService.getTableSample(tableName);
    }

    @Get('tables/:tableName/export')
    @ApiOperation({ summary: 'Download 10 random sample records for a table as a CSV file' })
    @ApiParam({ name: 'tableName', description: 'The model or database table name' })
    @ApiResponse({ status: 200, description: 'Downloadable CSV file' })
    async exportTableSample(
        @Param('tableName') tableName: string,
        @Res() res: express.Response,
    ) {
        const csvContent = await this.powerBiService.generateCsv(tableName);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${tableName.toLowerCase()}-sample.csv"`,
        );
        res.status(200).send(csvContent);
    }
}
