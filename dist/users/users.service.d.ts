import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    findByEmail(email: string): Promise<User | null>;
    findByResetToken(token: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    findById(id: string): Promise<User | null>;
    findAll(params?: {
        page?: number;
        limit?: number;
        role?: Role;
    }): Promise<{
        data: {
            lastEditActivityDate: Date;
            profile: ({
                mda: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                fullName: string;
                role: import("@prisma/client").$Enums.Role;
                mdaId: string | null;
                userId: string;
            }) | null;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    remove(id: string): Promise<User>;
}
