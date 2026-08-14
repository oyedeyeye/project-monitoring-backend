import { Role } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    fullName: string;
    role?: Role;
    mdaId?: string;
    password?: string;
}
