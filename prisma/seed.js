"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const adapter = new adapter_mariadb_1.PrismaMariaDb(process.env.DATABASE_URL || '');
const prisma = new client_1.PrismaClient({ adapter });
async function parseCsv(filePath) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}
async function main() {
    console.log('Starting database seeding...');
    console.log('Clearing existing data...');
    await prisma.issue.deleteMany();
    await prisma.financeRecord.deleteMany();
    await prisma.progressUpdate.deleteMany();
    await prisma.project.deleteMany();
    await prisma.mDA.deleteMany();
    console.log('Cleared existing data.');
    const csvDir = path.resolve(__dirname, '../../Analytics Dashboard/Data_CSV');
    console.log('Importing MDAs...');
    const mdas = await parseCsv(path.join(csvDir, 'mdas_with_ids.csv'));
    for (const mda of mdas) {
        if (!mda.id || !mda.name)
            continue;
        await prisma.mDA.create({
            data: {
                id: mda.id,
                name: mda.name,
                code: mda.code || null,
            },
        });
    }
    console.log(`Imported ${mdas.length} MDAs.`);
    console.log('Importing Projects...');
    const projects = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Projects_Master.csv'));
    let projectsImported = 0;
    for (const project of projects) {
        if (!project.project_id || !project.mda_id)
            continue;
        await prisma.project.create({
            data: {
                id: project.project_id,
                mdaId: project.mda_id,
                title: project.title,
                sector: project.sector,
                lga: project.lga,
                senatorialDistrict: project.senatorial_district,
                locationText: project.location_text,
                startDate: new Date(project.start_date),
                endDate: new Date(project.end_date),
                approvedBudget: parseFloat(project.approved_budget || '0'),
                fundingSource: project.funding_source,
                contractor: project.contractor || null,
                status: project.status,
            },
        });
        projectsImported++;
    }
    console.log(`Imported ${projectsImported} Projects.`);
    console.log('Importing Progress Updates...');
    const updates = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Progress_Updates.csv'));
    let updatesImported = 0;
    for (const update of updates) {
        if (!update.project_id || !update.report_date)
            continue;
        await prisma.progressUpdate.create({
            data: {
                projectId: update.project_id,
                reportDate: new Date(update.report_date),
                physicalProgressPct: parseFloat(update.physical_progress_pct || '0'),
                stage: update.stage,
                milestoneStatus: update.milestone_status,
                keyUpdate: update.key_update,
                issueFlag: update.issue_flag || null,
                evidenceLink: update.evidence_link || null,
                status: 'SUBMITTED',
            },
        });
        updatesImported++;
    }
    console.log(`Imported ${updatesImported} Progress Updates.`);
    console.log('Importing Finance Records...');
    const finances = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Finance_Totals.csv'));
    let financesImported = 0;
    for (const finance of finances) {
        if (!finance.project_id || !finance.budget_year)
            continue;
        await prisma.financeRecord.create({
            data: {
                projectId: finance.project_id,
                budgetYear: parseInt(finance.budget_year, 10),
                releaseToDate: parseFloat(finance.release_to_date || '0'),
                paymentsToDate: parseFloat(finance.payments_to_date || '0'),
            },
        });
        financesImported++;
    }
    console.log(`Imported ${financesImported} Finance Records.`);
    console.log('Importing Issues...');
    const issues = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Issues_Risks.csv'));
    let issuesImported = 0;
    for (const issue of issues) {
        if (!issue.project_id || !issue.log_date)
            continue;
        await prisma.issue.create({
            data: {
                projectId: issue.project_id,
                logDate: new Date(issue.log_date),
                issueCategory: issue.issue_type,
                issueItem: issue.issue_type,
                severity: parseInt(issue.severity || '1', 10),
                owner: issue.owner,
                dueDate: new Date(issue.due_date),
                status: issue.status,
                notes: issue.notes || '',
                followUp: issue.follow_up || null,
            },
        });
        issuesImported++;
    }
    console.log(`Imported ${issuesImported} Issues.`);
    console.log('Database seeding completed successfully.');
}
main()
    .catch((e) => {
    console.error('Error during seeding:');
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map