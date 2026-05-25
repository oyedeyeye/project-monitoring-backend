import { Controller, Sse, UseGuards, MessageEvent } from '@nestjs/common';
import { NotificationsService, NotificationEvent } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PPIMU_ADMIN, Role.WEBMASTER_ADMIN)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Stream real-time progress update submission events' })
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.notificationsService.getNotificationStream().pipe(
      map((event: NotificationEvent) => ({
        data: event,
      }) as MessageEvent)
    );
  }
}
