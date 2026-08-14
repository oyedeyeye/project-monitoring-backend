import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAnalytics(year: string, type: 'monthly' | 'quarterly', value: string): Promise<{
        executiveOverview: {
            totalProjects: number;
            statusDistribution: Record<string, number>;
            financials: {
                totalBudget: number;
                totalReleased: number;
                totalPayments: number;
                disbursementRate: number;
            };
            avgPhysicalProgress: number;
            activeIssuesCount: number;
        };
        sectorGeographical: {
            sectors: {
                name: any;
                projectCount: any;
                totalBudget: any;
                totalReleased: any;
                totalPayments: any;
                avgPhysicalProgress: number;
            }[];
            lgas: {
                name: any;
                projectCount: any;
                totalBudget: any;
                totalReleased: any;
                totalPayments: any;
                avgPhysicalProgress: number;
            }[];
            districts: {
                name: any;
                projectCount: any;
                totalBudget: any;
                totalReleased: any;
                totalPayments: any;
                avgPhysicalProgress: number;
            }[];
            fundingSources: {
                name: any;
                projectCount: any;
                totalBudget: any;
                totalReleased: any;
                totalPayments: any;
                avgPhysicalProgress: number;
            }[];
        };
        mdaScorecard: {
            mdaId: string;
            mdaName: string;
            projectCount: number;
            avgPhysicalProgress: number;
            totalBudget: number;
            totalReleased: number;
            totalPayments: number;
            updatesLogged: number;
            updatesSubmitted: number;
        }[];
        financeCost: {
            projectId: string;
            title: string;
            mdaName: string;
            approvedBudget: number;
            releaseToDate: number;
            paymentsToDate: number;
            physicalProgressPct: number;
            budgetSpentPct: number;
            costVariance: number;
        }[];
        riskBottlenecks: {
            issueCategories: {
                category: string;
                count: number;
            }[];
            severityDistribution: {
                severity: number;
                count: number;
            }[];
            overdueIssues: any[];
            topContractors: {
                contractor: string;
                projectCount: number;
                issueCount: number;
                stalledCount: number;
            }[];
            meanTimeToResolution: number;
        };
    }>;
}
