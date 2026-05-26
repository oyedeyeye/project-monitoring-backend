import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { MdasService } from './mdas.service';
import { Prisma, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
@Controller('mdas')
export class MdasController {
    constructor(private readonly mdasService: MdasService) { }

    @Roles(Role.WEBMASTER_ADMIN)
    @Post()
    create(@Body() createMdaDto: Prisma.MDACreateInput) {
        return this.mdasService.create(createMdaDto);
    }

    @Get()
    findAll() {
        return this.mdasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mdasService.findOne(id);
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMdaDto: Prisma.MDAUpdateInput) {
        return this.mdasService.update(id, updateMdaDto);
    }

    @Roles(Role.WEBMASTER_ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mdasService.remove(id);
    }
}
