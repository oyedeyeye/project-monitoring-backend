import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any, pageStr?: string, limitStr?: string, roleStr?: string): Promise<{
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
            passwordHash: string;
            createdAt: Date;
            updatedAt: Date;
            resetPasswordExpires: Date | null;
            resetPasswordToken: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    create(createUserDto: Prisma.UserCreateInput): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        resetPasswordExpires: Date | null;
        resetPasswordToken: string | null;
    }>;
    update(req: any, id: string, updateUserDto: Prisma.UserUpdateInput): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        resetPasswordExpires: Date | null;
        resetPasswordToken: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        resetPasswordExpires: Date | null;
        resetPasswordToken: string | null;
    }>;
}
