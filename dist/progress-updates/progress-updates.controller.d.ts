import { ProgressUpdatesService } from './progress-updates.service';
import { Prisma } from '@prisma/client';
export declare class ProgressUpdatesController {
    private readonly updatesService;
    constructor(updatesService: ProgressUpdatesService);
    create(createUpdateDto: Prisma.ProgressUpdateUncheckedCreateInput): Promise<{
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
    }>;
    findAll(req: any, page?: string, limit?: string, projectId?: string): Promise<{
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
    findOne(id: string): Promise<{
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
    } | null>;
    update(id: string, updateDto: Prisma.ProgressUpdateUncheckedUpdateInput): Promise<{
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
    }>;
    approve(id: string): Promise<{
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
    }>;
    reject(id: string): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
