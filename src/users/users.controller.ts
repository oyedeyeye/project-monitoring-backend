import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
    @Get()
    @ApiOperation({ summary: 'Retrieve all users' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 25)' })
    @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
    @ApiResponse({ status: 200, description: 'List of all users returned' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden / Invalid Role' })
    findAll(
        @Req() req: any,
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
        @Query('role') roleStr?: string,
    ) {
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        const limit = limitStr ? parseInt(limitStr, 10) : 25;
        const requestingRole = req.user.role;

        let role: Role | undefined = roleStr as Role;
        if (requestingRole === Role.PPIMU_ADMIN) {
            role = Role.MDA_OFFICER;
        }

        return this.usersService.findAll({ page, limit, role });
    }

    @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
    @Post()
    @ApiOperation({ summary: 'Create a new user manually' })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, passwordHash: { type: 'string' }, profile: { type: 'object' } } } })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden / Invalid Role' })
    create(@Body() createUserDto: Prisma.UserCreateInput) {
        return this.usersService.create(createUserDto);
    }

    @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
    @Put(':id')
    @ApiOperation({ summary: 'Update an existing user' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'User successfully updated' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() updateUserDto: Prisma.UserUpdateInput,
    ) {
        const targetUser = await this.usersService.findById(id) as any;
        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (req.user.role === Role.PPIMU_ADMIN && targetUser.profile?.role !== Role.MDA_OFFICER) {
            throw new ForbiddenException('You can only perform operations on MDA Officers');
        }

        const data = { ...updateUserDto } as any;
        if (data.password && data.password.trim() !== '') {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        } else {
            delete data.password;
        }

        return this.usersService.update(id, data);
    }

    @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User successfully deleted' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async remove(@Req() req: any, @Param('id') id: string) {
        const targetUser = await this.usersService.findById(id) as any;
        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (req.user.role === Role.PPIMU_ADMIN && targetUser.profile?.role !== Role.MDA_OFFICER) {
            throw new ForbiddenException('You can only perform operations on MDA Officers');
        }

        return this.usersService.remove(id);
    }
}
