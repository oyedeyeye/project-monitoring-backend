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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DashboardModule } from './dashboard/dashboard.module';
import { PowerBiModule } from './power-bi/power-bi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true, ttl: 60000 }), // 30 seconds cache TTL
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule, UsersModule, AuthModule, MdasModule, ProjectsModule, ProgressUpdatesModule, IssuesModule, EmailModule, NotificationsModule, DashboardModule, PowerBiModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
