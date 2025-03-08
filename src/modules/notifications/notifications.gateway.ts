import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    sendNotificationToUser(userId: string, notification: any) {
        this.server.to(userId).emit('new_notification', notification);
    };
}