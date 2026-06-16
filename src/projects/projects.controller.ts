import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, UseInterceptors } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Roles(Role.WEBMASTER_ADMIN)
    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, sector: { type: 'string' }, mdaId: { type: 'string' }, status: { type: 'string' } } } })
    @ApiResponse({ status: 201, description: 'Project successfully created' })
    @ApiResponse({ status: 403, description: 'Forbidden / Invalid Role' })
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve projects' })
    @ApiQuery({ name: 'mdaId', required: false, description: 'Filter by MDA ID (Admin only)' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by project status' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 25)' })
    @ApiResponse({ status: 200, description: 'List of projects based on user role' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Missing token' })
    findAll(
        @Req() req: any,
        @Query('mdaId') mdaId?: string,
        @Query('status') status?: string,
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
    ) {
        let page = pageStr ? parseInt(pageStr, 10) : 1;
        let limit = limitStr ? parseInt(limitStr, 10) : 25;
        
        // Prevent DoS: Hard cap limit to max 100
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        const userRole = req.user.role;
        const targetMdaId = userRole === Role.WEBMASTER_ADMIN ? mdaId : req.user.mdaId;

        return this.projectsService.findAll({
            mdaId: targetMdaId,
            status,
            page,
            limit,
        });
    }

    @Get(':projectId')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiParam({ name: 'projectId', description: 'Project UUID' })
    @ApiResponse({ status: 200, description: 'Project details returned' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    findOne(@Param('projectId') id: string, @Req() req: any) {
        return this.projectsService.findOne(id, req.user);
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Patch(':projectId')
    @ApiOperation({ summary: 'Update a project' })
    @ApiParam({ name: 'projectId', description: 'Project UUID' })
    @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Project successfully updated' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    update(@Param('projectId') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Delete(':projectId')
    @ApiOperation({ summary: 'Delete a project' })
    @ApiParam({ name: 'projectId', description: 'Project UUID' })
    @ApiResponse({ status: 200, description: 'Project successfully deleted' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    remove(@Param('projectId') id: string) {
        return this.projectsService.remove(id);
    }
}
