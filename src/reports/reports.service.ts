import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getReportAnalytics(year: number, type: 'monthly' | 'quarterly', value: number) {
    const { startDate, endDate } = this.getPeriodDates(year, type, value);

    // Fetch all MDAs for scorecard mapping
    const mdas = await this.prisma.mDA.findMany();

    // Fetch projects started on or before periodEndDate
    const projects = await this.prisma.project.findMany({
      where: {
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

    // 1. Executive Performance Overview
    const totalProjects = projects.length;
    const statusCounts: Record<string, number> = {
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
      const activeIssues = p.issues.filter(
        (i) => i.status === 'Open' && i.logDate <= endDate
      );
      return acc + activeIssues.length;
    }, 0);

    projects.forEach((p) => {
      // Status
      const statusKey = p.status || 'Not Started';
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;

      // Budget
      const budgetVal = Number(p.approvedBudget) || 0;
      totalBudget += budgetVal;

      // Cumulative Finance up to periodEndDate
      // Typically, we sum all finance records for this project (or filter by budgetYear <= year)
      const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
      const rel = projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
      const pay = projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);
      totalReleased += rel;
      totalPayments += pay;

      // Latest physical progress on or before periodEndDate
      const latestProgressUpdate = p.progressUpdates.find(
        (u) => u.reportDate <= endDate
      );
      const progressVal = latestProgressUpdate
        ? latestProgressUpdate.physicalProgressPct
        : 0;
      progressSum += progressVal;
      projectsWithProgressCount++;
    });

    const avgPhysicalProgress =
      projectsWithProgressCount > 0 ? progressSum / projectsWithProgressCount : 0;
    const disbursementRate =
      totalReleased > 0 ? (totalPayments / totalReleased) * 100 : 0;

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

    // 2. Sectoral & Geographical Distribution Reports
    const sectorStats: Record<string, any> = {};
    const lgaStats: Record<string, any> = {};
    const districtStats: Record<string, any> = {};
    const fundingSourceStats: Record<string, any> = {};

    projects.forEach((p) => {
      const budgetVal = Number(p.approvedBudget) || 0;
      const latestProgressUpdate = p.progressUpdates.find(
        (u) => u.reportDate <= endDate
      );
      const progressVal = latestProgressUpdate
        ? latestProgressUpdate.physicalProgressPct
        : 0;

      const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
      const relVal = projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
      const payVal = projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);

      // Helper function to update record
      const updateGroup = (group: Record<string, any>, key: string) => {
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

    const mapGroupToArray = (group: Record<string, any>) =>
      Object.values(group).map((g: any) => ({
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

    // 3. MDA Performance & Compliance Scorecard
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

        const latestProgressUpdate = p.progressUpdates.find(
          (u) => u.reportDate <= endDate
        );
        mdaProgressSum += latestProgressUpdate
          ? latestProgressUpdate.physicalProgressPct
          : 0;
      });

      // Compliance updates logged in this period
      const updatesLogged = mdaProjects.reduce((sum, p) => {
        const periodUpdates = p.progressUpdates.filter(
          (u) => u.createdAt >= startDate && u.createdAt <= endDate
        );
        return sum + periodUpdates.length;
      }, 0);

      const updatesSubmitted = mdaProjects.reduce((sum, p) => {
        const periodUpdates = p.progressUpdates.filter(
          (u) =>
            u.createdAt >= startDate &&
            u.createdAt <= endDate &&
            u.status === 'SUBMITTED'
        );
        return sum + periodUpdates.length;
      }, 0);

      return {
        mdaId: m.id,
        mdaName: m.name,
        projectCount: mdaProjectCount,
        avgPhysicalProgress:
          mdaProjectCount > 0 ? mdaProgressSum / mdaProjectCount : 0,
        totalBudget: mdaBudget,
        totalReleased: mdaReleased,
        totalPayments: mdaPayments,
        updatesLogged,
        updatesSubmitted,
      };
    });

    // 4. Project Finance & Cost Variance Report
    const financeCost = projects.map((p) => {
      const latestProgressUpdate = p.progressUpdates.find(
        (u) => u.reportDate <= endDate
      );
      const physicalProgressPct = latestProgressUpdate
        ? latestProgressUpdate.physicalProgressPct
        : 0;

      const projectFinance = p.financeRecords.filter(f => f.budgetYear <= year);
      const relVal = projectFinance.reduce((sum, f) => sum + Number(f.releaseToDate), 0);
      const payVal = projectFinance.reduce((sum, f) => sum + Number(f.paymentsToDate), 0);
      const budgetVal = Number(p.approvedBudget) || 0;

      const budgetSpentPct = budgetVal > 0 ? (payVal / budgetVal) * 100 : 0;
      // Cost Variance: Budget Spent % minus Physical Progress %
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

    // 5. Risk, Issues, and Bottleneck Intelligence Report
    const issueCategories: Record<string, number> = {};
    const severityCounts: Record<number, number> = {};
    const overdueIssuesList: any[] = [];
    const contractorMap: Record<
      string,
      { contractor: string; projectCount: number; issueCount: number; stalledCount: number }
    > = {};

    let resolvedCount = 0;
    let totalResolutionDays = 0;

    projects.forEach((p) => {
      // Contractor stats
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
        // Only count issues logged on or before periodEndDate
        if (i.logDate <= endDate) {
          contractorMap[contractorName].issueCount++;

          // Categories
          const category = i.issueCategory || 'Other';
          issueCategories[category] = (issueCategories[category] || 0) + 1;

          // Severity
          const sev = i.severity || 1;
          severityCounts[sev] = (severityCounts[sev] || 0) + 1;

          // Overdue: status is Open and logDate <= endDate and dueDate < endDate
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

          // Resolution time: if updated and resolved within this period
          if (
            i.status !== 'Open' &&
            i.updatedAt >= startDate &&
            i.updatedAt <= endDate
          ) {
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
      .slice(0, 10); // top 10

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

  private getPeriodDates(year: number, type: 'monthly' | 'quarterly', value: number) {
    let startDate: Date;
    let endDate: Date;
    if (type === 'monthly') {
      // value is 1-12
      startDate = new Date(Date.UTC(year, value - 1, 1, 0, 0, 0, 0));
      // Last day of month
      endDate = new Date(Date.UTC(year, value, 0, 23, 59, 59, 999));
    } else {
      // quarterly: value is 1-4
      const startMonth = (value - 1) * 3;
      startDate = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
      // Last day of quarter
      endDate = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999));
    }
    return { startDate, endDate };
  }
}
