import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL || '');
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@ppmiu.ondo.gov.ng' } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }
  
  const passwordHash = await bcrypt.hash('SecurePassword123!', 10);
  await prisma.user.create({
    data: {
      email: 'admin@ppmiu.ondo.gov.ng',
      passwordHash,
      profile: {
        create: {
          fullName: 'System Administrator',
          role: 'WEBMASTER_ADMIN'
        }
      }
    }
  });
  console.log('System Administrator created successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
