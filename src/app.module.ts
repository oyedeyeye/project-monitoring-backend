import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MdasModule } from './mdas/mdas.module';
import { ProjectsModule } from './projects/projects.module';
import { ProgressUpdatesModule } from './progress-updates/progress-updates.module';

import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, UsersModule, AuthModule, MdasModule, ProjectsModule, ProgressUpdatesModule, EmailModule, NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
