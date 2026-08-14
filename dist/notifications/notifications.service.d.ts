import { Observable } from 'rxjs';
export interface NotificationEvent {
    id: string;
    projectId: string;
    projectTitle: string;
    mdaName: string;
    submittedAt: string;
    physicalProgressPct: number;
}
export declare class NotificationsService {
    private readonly notificationSubject;
    getNotificationStream(): Observable<NotificationEvent>;
    emitNewUpdateSubmitted(event: NotificationEvent): void;
}
