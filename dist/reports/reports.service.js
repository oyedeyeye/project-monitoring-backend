"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReportAnalytics(year, type, value) {
        const { startDate, endDate } = this.getPeriodDates(year, type, value);
        const mdas = await this.prisma.mDA.findMany();
        const projects = await this.prisma.project.findMany({
            where: {
                isArchived: false,
                startDate: {
                    lte: endDate,
                },
            },
            include: {
                mda: true,
                progressUpdates: {
                    orderBy: {
                        reportDate: 'desc',
                    },
                },
                financeRecords: true,
                issues: true,
            },
        });
        const totalProjects = projects.length;
        const statusCounts = {
            Ongoing: 0,
            Completed: 0,
            Stalled: 0,
            'Not Started': 0,
        };
        let totalBudget = 0;
        let totalReleased = 0;
        let totalPayments = 0;
        let progressSum = 0;
        let projectsWithProgressCount = 0;
        const activeIssuesCount = projects.reduce((acc, p) => {
            const activeIssues = p.issues.filter((i) => i.status === 'Open' && i.logDate <= endDate);
            return acc + activeIssues.length;
        }, 0);
        projects.forEach((p) => {
            const statusKey = p.status || 'Not Started';
            statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
            const budgetVal = Number(p.approvedBudget) || 0;
            totalBudget += budgetVal;
            const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
            const rel = projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
            const pay = projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);
            totalReleased += rel;
            totalPayments += pay;
            const latestProgressUpdate = p.progressUpdates.find((u) => u.reportDate <= endDate);
            const progressVal = latestProgressUpdate
                ? latestProgressUpdate.physicalProgressPct
                : 0;
            progressSum += progressVal;
            projectsWithProgressCount++;
        });
        const avgPhysicalProgress = projectsWithProgressCount > 0 ? progressSum / projectsWithProgressCount : 0;
        const disbursementRate = totalReleased > 0 ? (totalPayments / totalReleased) * 100 : 0;
        const executiveOverview = {
            totalProjects,
            statusDistribution: statusCounts,
            financials: {
                totalBudget,
                totalReleased,
                totalPayments,
                disbursementRate,
            },
            avgPhysicalProgress,
            activeIssuesCount,
        };
        const sectorStats = {};
        const lgaStats = {};
        const districtStats = {};
        const fundingSourceStats = {};
        projects.forEach((p) => {
            const budgetVal = Number(p.approvedBudget) || 0;
            const latestProgressUpdate = p.progressUpdates.find((u) => u.reportDate <= endDate);
            const progressVal = latestProgressUpdate
                ? latestProgressUpdate.physicalProgressPct
                : 0;
            const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
            const relVal = projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
            const payVal = projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);
            const updateGroup = (group, key) => {
                if (!group[key]) {
                    group[key] = {
                        name: key,
                        projectCount: 0,
                        totalBudget: 0,
                        totalReleased: 0,
                        totalPayments: 0,
                        progressSum: 0,
                    };
                }
                group[key].projectCount++;
                group[key].totalBudget += budgetVal;
                group[key].totalReleased += relVal;
                group[key].totalPayments += payVal;
                group[key].progressSum += progressVal;
            };
            updateGroup(sectorStats, p.sector || 'Unassigned');
            updateGroup(lgaStats, p.lga || 'Unassigned');
            updateGroup(districtStats, p.senatorialDistrict || 'Unassigned');
            updateGroup(fundingSourceStats, p.fundingSource || 'Unassigned');
        });
        const mapGroupToArray = (group) => Object.values(group).map((g) => ({
            name: g.name,
            projectCount: g.projectCount,
            totalBudget: g.totalBudget,
            totalReleased: g.totalReleased,
            totalPayments: g.totalPayments,
            avgPhysicalProgress: g.projectCount > 0 ? g.progressSum / g.projectCount : 0,
        }));
        const sectorGeographical = {
            sectors: mapGroupToArray(sectorStats),
            lgas: mapGroupToArray(lgaStats),
            districts: mapGroupToArray(districtStats),
            fundingSources: mapGroupToArray(fundingSourceStats),
        };
        const mdaScorecard = mdas.map((m) => {
            const mdaProjects = projects.filter((p) => p.mdaId === m.id);
            const mdaProjectCount = mdaProjects.length;
            let mdaBudget = 0;
            let mdaReleased = 0;
            let mdaPayments = 0;
            let mdaProgressSum = 0;
            mdaProjects.forEach((p) => {
                mdaBudget += Number(p.approvedBudget) || 0;
                const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
                mdaReleased += projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
                mdaPayments += projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);
                const latestProgressUpdate = p.progressUpdates.find((u) => u.reportDate <= endDate);
                mdaProgressSum += latestProgressUpdate
                    ? latestProgressUpdate.physicalProgressPct
                    : 0;
            });
            const updatesLogged = mdaProjects.reduce((sum, p) => {
                const periodUpdates = p.progressUpdates.filter((u) => u.createdAt >= startDate && u.createdAt <= endDate);
                return sum + periodUpdates.length;
            }, 0);
            const updatesSubmitted = mdaProjects.reduce((sum, p) => {
                const periodUpdates = p.progressUpdates.filter((u) => u.createdAt >= startDate &&
                    u.createdAt <= endDate &&
                    u.status === 'SUBMITTED');
                return sum + periodUpdates.length;
            }, 0);
            return {
                mdaId: m.id,
                mdaName: m.name,
                projectCount: mdaProjectCount,
                avgPhysicalProgress: mdaProjectCount > 0 ? mdaProgressSum / mdaProjectCount : 0,
                totalBudget: mdaBudget,
                totalReleased: mdaReleased,
                totalPayments: mdaPayments,
                updatesLogged,
                updatesSubmitted,
            };
        });
        const financeCost = projects.map((p) => {
            const latestProgressUpdate = p.progressUpdates.find((u) => u.reportDate <= endDate);
            const physicalProgressPct = latestProgressUpdate
                ? latestProgressUpdate.physicalProgressPct
                : 0;
            const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
            const relVal = projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
            const payVal = projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);
            const budgetVal = Number(p.approvedBudget) || 0;
            const budgetSpentPct = budgetVal > 0 ? (payVal / budgetVal) * 100 : 0;
            const costVariance = budgetSpentPct - physicalProgressPct;
            return {
                projectId: p.projectId,
                title: p.title,
                mdaName: p.mda?.name || 'Unassigned',
                approvedBudget: budgetVal,
                releaseToDate: relVal,
                paymentsToDate: payVal,
                physicalProgressPct,
                budgetSpentPct,
                costVariance,
            };
        });
        const issueCategories = {};
        const severityCounts = {};
        const overdueIssuesList = [];
        const contractorMap = {};
        let resolvedCount = 0;
        let totalResolutionDays = 0;
        projects.forEach((p) => {
            const contractorName = p.contractor || 'Unknown Contractor';
            if (!contractorMap[contractorName]) {
                contractorMap[contractorName] = {
                    contractor: contractorName,
                    projectCount: 0,
                    issueCount: 0,
                    stalledCount: 0,
                };
            }
            contractorMap[contractorName].projectCount++;
            if (p.status === 'Stalled') {
                contractorMap[contractorName].stalledCount++;
            }
            p.issues.forEach((i) => {
                if (i.logDate <= endDate) {
                    contractorMap[contractorName].issueCount++;
                    const category = i.issueCategory || 'Other';
                    issueCategories[category] = (issueCategories[category] || 0) + 1;
                    const sev = i.severity || 1;
                    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
                    if (i.status === 'Open' && i.dueDate < endDate) {
                        overdueIssuesList.push({
                            id: i.id,
                            projectId: p.projectId,
                            projectTitle: p.title,
                            issueItem: i.issueItem,
                            issueCategory: category,
                            severity: sev,
                            owner: i.owner,
                            dueDate: i.dueDate,
                            status: i.status,
                        });
                    }
                    if (i.status !== 'Open' &&
                        i.updatedAt >= startDate &&
                        i.updatedAt <= endDate) {
                        resolvedCount++;
                        const diffTime = Math.abs(i.updatedAt.getTime() - i.logDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        totalResolutionDays += diffDays;
                    }
                }
            });
        });
        const topContractors = Object.values(contractorMap)
            .sort((a, b) => b.issueCount + b.stalledCount - (a.issueCount + a.stalledCount))
            .slice(0, 10);
        const meanTimeToResolution = resolvedCount > 0 ? totalResolutionDays / resolvedCount : 0;
        const riskBottlenecks = {
            issueCategories: Object.entries(issueCategories).map(([category, count]) => ({
                category,
                count,
            })),
            severityDistribution: Object.entries(severityCounts).map(([severity, count]) => ({
                severity: Number(severity),
                count,
            })),
            overdueIssues: overdueIssuesList,
            topContractors,
            meanTimeToResolution,
        };
        return {
            executiveOverview,
            sectorGeographical,
            mdaScorecard,
            financeCost,
            riskBottlenecks,
        };
    }
    getPeriodDates(year, type, value) {
        let startDate;
        let endDate;
        if (type === 'monthly') {
            startDate = new Date(Date.UTC(year, value - 1, 1, 0, 0, 0, 0));
            endDate = new Date(Date.UTC(year, value, 0, 23, 59, 59, 999));
        }
        else {
            const startMonth = (value - 1) * 3;
            startDate = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
            endDate = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999));
        }
        return { startDate, endDate };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map