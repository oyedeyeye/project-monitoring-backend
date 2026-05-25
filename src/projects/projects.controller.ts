import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Roles(Role.WEBMASTER_ADMIN)
    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, sector: { type: 'string' }, mdaId: { type: 'string' }, status: { type: 'string' } } } })
    @ApiResponse({ status: 201, description: 'Project successfully created' })
    @ApiResponse({ status: 403, description: 'Forbidden / Invalid Role' })
    create(@Body() createProjectDto: Prisma.ProjectCreateInput) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve projects' })
    @ApiQuery({ name: 'mdaId', required: false, description: 'Filter by MDA ID (Admin only)' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 25)' })
    @ApiResponse({ status: 200, description: 'List of projects based on user role' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Missing token' })
    findAll(
        @Req() req: any,
        @Query('mdaId') mdaId?: string,
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
    ) {
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        const limit = limitStr ? parseInt(limitStr, 10) : 25;
        const userRole = req.user.role;
        const userMdaId = req.user.mdaId;

        const targetMdaId = userRole === Role.WEBMASTER_ADMIN ? mdaId : userMdaId;

        return this.projectsService.findAll({
            mdaId: targetMdaId,
            page,
            limit,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiParam({ name: 'id', description: 'Project UUID' })
    @ApiResponse({ status: 200, description: 'Project details returned' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Update a project' })
    @ApiParam({ name: 'id', description: 'Project UUID' })
    @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Project successfully updated' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    update(@Param('id') id: string, @Body() updateProjectDto: Prisma.ProjectUpdateInput) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project' })
    @ApiParam({ name: 'id', description: 'Project UUID' })
    @ApiResponse({ status: 200, description: 'Project successfully deleted' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}
