import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { UserScopedCacheInterceptor } from '../common/interceptors/user-scoped-cache.interceptor';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(UserScopedCacheInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Prisma returns the full row, including the bcrypt hash and the reset-token
   * digest. Neither belongs in an HTTP response.
   */
  private sanitize<T extends Record<string, any>>(user: T) {
    const {
      passwordHash: _passwordHash,
      resetPasswordToken: _resetPasswordToken,
      resetPasswordExpires: _resetPasswordExpires,
      ...safe
    } = user;
    return safe;
  }

  @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 25)',
  })
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

  // NOTE: POST /users was removed. It accepted a raw Prisma.UserCreateInput
  // and persisted `passwordHash` verbatim from the request body (no bcrypt),
  // and had no PPIMU_ADMIN target-role restriction. All user provisioning now
  // goes through POST /auth/register, which hashes and sends onboarding mail.

  @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden / Invalid Role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const targetUser = (await this.usersService.findById(id)) as any;
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (
      req.user.role === Role.PPIMU_ADMIN &&
      targetUser.profile?.role !== Role.MDA_OFFICER
    ) {
      throw new ForbiddenException(
        'You can only perform operations on MDA Officers',
      );
    }

    // A PPIMU_ADMIN may edit MDA Officers but must not be able to promote one
    // (or themselves, via another account) to a higher role.
    if (
      req.user.role === Role.PPIMU_ADMIN &&
      updateUserDto.role &&
      updateUserDto.role !== Role.MDA_OFFICER
    ) {
      throw new ForbiddenException(
        'You can only assign the MDA Officer role',
      );
    }

    const { email, fullName, role, mdaId, password } = updateUserDto;

    // Build the Prisma payload here rather than accepting one from the client,
    // so only these five fields are ever writable.
    const data: Prisma.UserUpdateInput = {};
    if (email !== undefined) data.email = email;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const profileData: Prisma.UserProfileUpdateWithoutUserInput = {};
    if (fullName !== undefined) profileData.fullName = fullName;
    if (role !== undefined) profileData.role = role;
    if (mdaId !== undefined) {
      profileData.mda = mdaId
        ? { connect: { id: mdaId } }
        : { disconnect: true };
    }
    if (Object.keys(profileData).length > 0) {
      data.profile = { update: profileData };
    }

    const updated = await this.usersService.update(id, data);
    return this.sanitize(updated);
  }

  @Roles(Role.WEBMASTER_ADMIN, Role.PPIMU_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const targetUser = (await this.usersService.findById(id)) as any;
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (
      req.user.role === Role.PPIMU_ADMIN &&
      targetUser.profile?.role !== Role.MDA_OFFICER
    ) {
      throw new ForbiddenException(
        'You can only perform operations on MDA Officers',
      );
    }

    const removed = await this.usersService.remove(id);
    return this.sanitize(removed);
  }
}
