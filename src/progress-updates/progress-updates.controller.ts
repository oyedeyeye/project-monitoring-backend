import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { ProgressUpdatesService } from './progress-updates.service';
import { Prisma, Role, ReportStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('progress-updates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress-updates')
export class ProgressUpdatesController {
    constructor(private readonly updatesService: ProgressUpdatesService) { }

    @Roles(Role.MDA_OFFICER, Role.WEBMASTER_ADMIN)
    @Post()
    create(@Body() createUpdateDto: Prisma.ProgressUpdateCreateInput) {
        return this.updatesService.create(createUpdateDto);
    }

    @Get()
    findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('projectId') projectId?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 25;
        const options = { page: pageNum, limit: limitNum, projectId };

        if (req.user.role === Role.WEBMASTER_ADMIN) {
            return this.updatesService.findAll(options);
        }
        if (req.user.role === Role.PPIMU_ADMIN) {
            return this.updatesService.findAllSubmitted(options);
        }
        // MDA_OFFICER sees updates from their MDA 
        return this.updatesService.findAllByMda(req.user.mdaId, options);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.updatesService.findOne(id);
    }

    @Roles(Role.MDA_OFFICER, Role.WEBMASTER_ADMIN)
    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: Prisma.ProgressUpdateUpdateInput) {
        return this.updatesService.update(id, updateDto);
    }

    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN)
    @Put(':id/approve')
    approve(@Param('id') id: string) {
        return this.updatesService.update(id, { milestoneStatus: 'Approved' });
    }

    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN)
    @Put(':id/reject')
    reject(@Param('id') id: string) {
        return this.updatesService.update(id, { milestoneStatus: 'Changes Required' });
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.updatesService.remove(id);
    }
}
