import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DashboardOverviewResponseDto } from './dashboard.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    @ApiOperation({ summary: 'Get aggregated dashboard analytics overview' })
    @ApiResponse({ status: 200, description: 'Dashboard overview data', type: DashboardOverviewResponseDto })
    @ApiQuery({ name: 'mdaId', required: false, description: 'Filter data by MDA (Admins only)' })
    @ApiQuery({ name: 'period', required: false, description: 'Comparison period (default: month)' })
    getOverview(
        @Req() req: any,
        @Query('mdaId') mdaIdQuery?: string,
    ) {
        return this.dashboardService.getOverview(req.user, mdaIdQuery);
    }
}
