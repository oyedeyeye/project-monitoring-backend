import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, MDA } from '@prisma/client';

@Injectable()
export class MdasService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.MDACreateInput): Promise<MDA> {
        return this.prisma.mDA.create({ data });
    }

    async findAll(): Promise<MDA[]> {
        return this.prisma.mDA.findMany();
    }

    async findOne(id: string): Promise<MDA | null> {
        return this.prisma.mDA.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: Prisma.MDAUpdateInput): Promise<MDA> {
        return this.prisma.mDA.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<MDA> {
        return this.prisma.mDA.delete({
            where: { id },
        });
    }
}
