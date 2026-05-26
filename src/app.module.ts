import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MdasModule } from './mdas/mdas.module';
import { ProjectsModule } from './projects/projects.module';
import { ProgressUpdatesModule } from './progress-updates/progress-updates.module';
import { IssuesModule } from './issues/issues.module';
import { CacheModule } from '@nestjs/cache-manager';

import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 60000 }), // 30 seconds cache TTL
    PrismaModule, UsersModule, AuthModule, MdasModule, ProjectsModule, ProgressUpdatesModule, IssuesModule, EmailModule, NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
