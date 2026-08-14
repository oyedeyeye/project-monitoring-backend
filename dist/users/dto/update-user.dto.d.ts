import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    email?: string;
    fullName?: string;
    role?: Role;
    mdaId?: string | null;
    password?: string;
}
