import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Issue, Role } from '@prisma/client';
type ActingUser = {
    role: Role;
    mdaId?: string;
};
export declare class IssuesService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertCanAccess;
    findAll(user: {
        role: Role;
        mdaId?: string;
    }, projectId?: string): Promise<Issue[]>;
    create(data: Prisma.IssueUncheckedCreateInput, user: ActingUser): Promise<Issue>;
    update(id: string, data: Prisma.IssueUncheckedUpdateInput, user: ActingUser): Promise<Issue>;
    remove(id: string, user: ActingUser): Promise<Issue>;
}
export {};
