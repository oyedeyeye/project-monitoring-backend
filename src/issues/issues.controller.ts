import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('issues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('issues')
export class IssuesController {
    constructor(private readonly issuesService: IssuesService) {}

    @Post()
    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN, Role.MDA_OFFICER)
    @ApiOperation({ summary: 'Create a new issue' })
    create(@Body() createIssueDto: Prisma.IssueUncheckedCreateInput) {
        return this.issuesService.create(createIssueDto);
    }

    @Get()
    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN, Role.MDA_OFFICER)
    @ApiOperation({ summary: 'Get all issues, optionally filtered by projectId' })
    findAll(@Req() req: any, @Query('projectId') projectId?: string) {
        return this.issuesService.findAll(req.user, projectId);
    }

    @Patch(':id')
    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN, Role.MDA_OFFICER)
    @ApiOperation({ summary: 'Update an issue' })
    update(@Param('id') id: string, @Body() updateIssueDto: Prisma.IssueUncheckedUpdateInput) {
        return this.issuesService.update(id, updateIssueDto);
    }

    @Patch(':id/resolve')
    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN, Role.MDA_OFFICER)
    @ApiOperation({ summary: 'Resolve an issue' })
    resolve(@Param('id') id: string) {
        return this.issuesService.update(id, { status: 'Resolved' });
    }

    @Delete(':id')
    @Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN, Role.MDA_OFFICER)
    @ApiOperation({ summary: 'Delete an issue' })
    remove(@Param('id') id: string) {
        return this.issuesService.remove(id);
    }
}
