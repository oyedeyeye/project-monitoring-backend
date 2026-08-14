import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProgressUpdate } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ProgressUpdatesService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    private checkAndBroadcast;
    create(data: Prisma.ProgressUpdateUncheckedCreateInput): Promise<ProgressUpdate>;
    findAllByMda(mdaId: string, options?: {
        page?: number;
        limit?: number;
        projectId?: string;
    }): Promise<{
        data: ({
            project: {
                createdAt: Date;
                updatedAt: Date;
                mdaId: string;
                projectId: string;
                status: string;
                title: string;
                sector: string;
                lga: string;
                senatorialDistrict: string;
                locationText: string;
                startDate: Date;
                endDate: Date;
                approvedBudget: Prisma.Decimal;
                fundingSource: string;
                contractor: string | null;
                isArchived: boolean;
            };
            issues: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                status: string;
                logDate: Date;
                issueCategory: string;
                issueItem: string;
                severity: number;
                owner: string;
                dueDate: Date;
                notes: string;
                followUp: string | null;
                progressUpdateId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            reportDate: Date;
            physicalProgressPct: number;
            stage: string;
            milestoneStatus: string;
            keyUpdate: string;
            issueFlag: string | null;
            evidenceLink: string | null;
            status: import("@prisma/client").$Enums.ReportStatus;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAllSubmitted(options?: {
        page?: number;
        limit?: number;
        projectId?: string;
    }): Promise<{
        data: ({
            project: {
                createdAt: Date;
                updatedAt: Date;
                mdaId: string;
                projectId: string;
                status: string;
                title: string;
                sector: string;
                lga: string;
                senatorialDistrict: string;
                locationText: string;
                startDate: Date;
                endDate: Date;
                approvedBudget: Prisma.Decimal;
                fundingSource: string;
                contractor: string | null;
                isArchived: boolean;
            };
            issues: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                status: string;
                logDate: Date;
                issueCategory: string;
                issueItem: string;
                severity: number;
                owner: string;
                dueDate: Date;
                notes: string;
                followUp: string | null;
                progressUpdateId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            reportDate: Date;
            physicalProgressPct: number;
            stage: string;
            milestoneStatus: string;
            keyUpdate: string;
            issueFlag: string | null;
            evidenceLink: string | null;
            status: import("@prisma/client").$Enums.ReportStatus;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAll(options?: {
        page?: number;
        limit?: number;
        projectId?: string;
    }): Promise<{
        data: ({
            project: {
                createdAt: Date;
                updatedAt: Date;
                mdaId: string;
                projectId: string;
                status: string;
                title: string;
                sector: string;
                lga: string;
                senatorialDistrict: string;
                locationText: string;
                startDate: Date;
                endDate: Date;
                approvedBudget: Prisma.Decimal;
                fundingSource: string;
                contractor: string | null;
                isArchived: boolean;
            };
            issues: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                status: string;
                logDate: Date;
                issueCategory: string;
                issueItem: string;
                severity: number;
                owner: string;
                dueDate: Date;
                notes: string;
                followUp: string | null;
                progressUpdateId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            reportDate: Date;
            physicalProgressPct: number;
            stage: string;
            milestoneStatus: string;
            keyUpdate: string;
            issueFlag: string | null;
            evidenceLink: string | null;
            status: import("@prisma/client").$Enums.ReportStatus;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<ProgressUpdate | null>;
    update(id: string, data: Prisma.ProgressUpdateUncheckedUpdateInput): Promise<ProgressUpdate>;
    remove(id: string): Promise<ProgressUpdate>;
}
