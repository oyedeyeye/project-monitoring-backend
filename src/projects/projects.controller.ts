import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, UseInterceptors, UploadedFile, BadRequestException, Header } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserScopedCacheInterceptor } from '../common/interceptors/user-scoped-cache.interceptor';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(UserScopedCacheInterceptor)
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

    @Roles(Role.WEBMASTER_ADMIN)
    @Get('import/template')
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment; filename="projects_import_template.csv"')
    @ApiOperation({ summary: 'Download CSV template for project import' })
    @ApiResponse({ status: 200, description: 'CSV template content' })
    async getImportTemplate() {
        const headers = 'mda,project,budget';
        const sampleRow1 = '"TEACHING SERVICE COMMISSION",,';
        const sampleRow2 = '"TEACHING SERVICE COMMISSION","Purchase of Laptops",5000000';
        
        return `${headers}\n${sampleRow1}\n${sampleRow2}`;
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Post('import/csv')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Import projects from CSV' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Projects successfully imported' })
    @ApiResponse({ status: 400, description: 'Invalid CSV format or missing fields' })
    async importCsv(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('CSV file is required');
        }
        return this.projectsService.importCsv(file.buffer);
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve projects' })
    @ApiQuery({ name: 'mdaId', required: false, description: 'Filter by MDA ID (Admin only)' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by project status' })
    @ApiQuery({ name: 'lga', required: false, description: 'Filter by local government area (LGA)' })
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
        @Query('lga') lga?: string,
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
            lga,
            page,
            limit,
        });
    }

    @Get('archive/:year')
    @ApiOperation({ summary: 'Get archived projects by budget year' })
    @ApiParam({ name: 'year', description: 'Budget Year (e.g. 2025)' })
    @ApiResponse({ status: 200, description: 'Archived projects returned' })
    async getArchivedByYear(@Param('year') year: string) {
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum)) {
            throw new BadRequestException('Invalid year format');
        }
        return this.projectsService.getArchivedByYear(yearNum);
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
