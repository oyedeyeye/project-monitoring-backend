import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface NotificationEvent {
  id: string;
  projectId: string;
  projectTitle: string;
  mdaName: string;
  submittedAt: string;
  physicalProgressPct: number;
}

@Injectable()
export class NotificationsService {
  private readonly notificationSubject = new Subject<NotificationEvent>();

  getNotificationStream(): Observable<NotificationEvent> {
    return this.notificationSubject.asObservable();
  }

  emitNewUpdateSubmitted(event: NotificationEvent) {
    this.notificationSubject.next(event);
  }
}
