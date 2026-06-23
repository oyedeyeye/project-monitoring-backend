import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.WEBMASTER_ADMIN)
  @Get('analytics')
  @ApiOperation({ summary: 'Get aggregated analytical reports for a period' })
  @ApiQuery({ name: 'year', required: true, description: 'Year of the report' })
  @ApiQuery({ name: 'type', required: true, enum: ['monthly', 'quarterly'], description: 'Period type' })
  @ApiQuery({ name: 'value', required: true, description: 'Month (1-12) or Quarter (1-4)' })
  @ApiResponse({ status: 200, description: 'Analytical reports payload' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 403, description: 'Forbidden / Unauthorized role' })
  async getAnalytics(
    @Query('year') year: string,
    @Query('type') type: 'monthly' | 'quarterly',
    @Query('value') value: string,
  ) {
    const yearInt = parseInt(year, 10);
    const valueInt = parseInt(value, 10);

    if (!year || isNaN(yearInt)) {
      throw new BadRequestException('Year must be a valid number');
    }
    if (type !== 'monthly' && type !== 'quarterly') {
      throw new BadRequestException('Type must be either "monthly" or "quarterly"');
    }
    if (!value || isNaN(valueInt)) {
      throw new BadRequestException('Value must be a valid number');
    }
    if (type === 'monthly' && (valueInt < 1 || valueInt > 12)) {
      throw new BadRequestException('Monthly value must be between 1 and 12');
    }
    if (type === 'quarterly' && (valueInt < 1 || valueInt > 4)) {
      throw new BadRequestException('Quarterly value must be between 1 and 4');
    }

    return await this.reportsService.getReportAnalytics(yearInt, type, valueInt);
  }
}
