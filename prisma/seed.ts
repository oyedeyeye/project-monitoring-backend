import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL || '');
const prisma = new PrismaClient({ adapter });

async function parseCsv(filePath: string): Promise<any[]> {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function main() {
  console.log('Starting database seeding...');

  // 1. Wipe existing project/mda data (respecting foreign key constraints)
  console.log('Clearing existing data...');
  await prisma.issue.deleteMany();
  await prisma.financeRecord.deleteMany();
  await prisma.progressUpdate.deleteMany();
  await prisma.project.deleteMany();
  
  // Note: Since UserProfile references MDA (SetNull), we don't necessarily have to delete users,
  // but we can delete MDAs safely.
  await prisma.mDA.deleteMany();
  console.log('Cleared existing data.');

  const csvDir = path.resolve(__dirname, '../../Analytics Dashboard/Data_CSV');

  // 2. Import MDAs
  console.log('Importing MDAs...');
  const mdas = await parseCsv(path.join(csvDir, 'mdas_with_ids.csv'));
  for (const mda of mdas) {
    if (!mda.id || !mda.name) continue;
    await prisma.mDA.create({
      data: {
        id: mda.id,
        name: mda.name,
        code: mda.code || null,
      },
    });
  }
  console.log(`Imported ${mdas.length} MDAs.`);

  // 3. Import Projects
  console.log('Importing Projects...');
  const projects = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Projects_Master.csv'));
  let projectsImported = 0;
  for (const project of projects) {
    if (!project.project_id || !project.mda_id) continue;
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

  // 4. Import Progress Updates
  console.log('Importing Progress Updates...');
  const updates = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Progress_Updates.csv'));
  let updatesImported = 0;
  for (const update of updates) {
    if (!update.project_id || !update.report_date) continue;
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
        status: 'SUBMITTED', // Default as per plan
      },
    });
    updatesImported++;
  }
  console.log(`Imported ${updatesImported} Progress Updates.`);

  // 5. Import Finance Records
  console.log('Importing Finance Records...');
  const finances = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Finance_Totals.csv'));
  let financesImported = 0;
  for (const finance of finances) {
    if (!finance.project_id || !finance.budget_year) continue;
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

  // 6. Import Issues
  console.log('Importing Issues...');
  const issues = await parseCsv(path.join(csvDir, 'test_data_ondo_ppimu - Issues_Risks.csv'));
  let issuesImported = 0;
  for (const issue of issues) {
    if (!issue.project_id || !issue.log_date) continue;
    await prisma.issue.create({
      data: {
        projectId: issue.project_id,
        logDate: new Date(issue.log_date),
        issueCategory: issue.issue_type,
        issueItem: issue.issue_type, // Using issue_type as per user approval
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
