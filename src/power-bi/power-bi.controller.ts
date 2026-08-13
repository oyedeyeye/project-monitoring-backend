import { Controller, Get, Param, Res, Query, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { PowerBiService } from './power-bi.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PowerBiApiKeyGuard } from '../auth/guards/powerbi-api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/** Upper bound on rows per ingestion request. Must stay >= the 1000 default. */
const MAX_PAGE_SIZE = 5000;

@ApiTags('power-bi')
@Controller('power-bi')
export class PowerBiController {
    constructor(private readonly powerBiService: PowerBiService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WEBMASTER_ADMIN)
    @Get('tables')
    @ApiOperation({ summary: 'Get list of available tables and their schemas' })
    @ApiResponse({ status: 200, description: 'Table structures' })
    getTablesStructure() {
        return this.powerBiService.getTablesStructure();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WEBMASTER_ADMIN)
    @Get('tables/:tableName/sample')
    @ApiOperation({ summary: 'Get up to 10 random sample records for a table' })
    @ApiParam({ name: 'tableName', description: 'The model or database table name' })
    @ApiResponse({ status: 200, description: 'Sample records array' })
    getTableSample(@Param('tableName') tableName: string) {
        return this.powerBiService.getTableSample(tableName);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.WEBMASTER_ADMIN)
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

    @UseGuards(PowerBiApiKeyGuard)
    @Get('tables/:tableName/data')
    @ApiOperation({ summary: 'Paginated data ingestion endpoint for Power BI' })
    @ApiParam({ name: 'tableName', description: 'The model or database table name' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 1000)' })
    @ApiResponse({ status: 200, description: 'Paginated JSON data for ingestion' })
    @ApiResponse({ status: 401, description: 'Missing or Invalid API Key' })
    getTableData(
        @Param('tableName') tableName: string,
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
    ) {
        // These values are interpolated straight into `LIMIT ${limit} OFFSET
        // ${offset}` in the service, so they must be sane integers: an
        // unparseable value would otherwise emit `LIMIT NaN` (500), and an
        // unbounded one would allow a full-table dump in a single request.
        const parsedPage = parseInt(pageStr ?? '', 10);
        const parsedLimit = parseInt(limitStr ?? '', 10);

        const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
        let limit = Number.isFinite(parsedLimit) && parsedLimit >= 1 ? parsedLimit : 1000;
        if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

        return this.powerBiService.getTableData(tableName, page, limit);
    }
}
