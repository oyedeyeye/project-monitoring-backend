import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    private sanitize;
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
    update(req: any, id: string, updateUserDto: UpdateUserDto): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        resetPasswordExpires: Date | null;
        resetPasswordToken: string | null;
    }, "passwordHash" | "resetPasswordExpires" | "resetPasswordToken">>;
    remove(req: any, id: string): Promise<Omit<{
        id: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        resetPasswordExpires: Date | null;
        resetPasswordToken: string | null;
    }, "passwordHash" | "resetPasswordExpires" | "resetPasswordToken">>;
}
