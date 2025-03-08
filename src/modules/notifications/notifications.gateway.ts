import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'messages/notifications' }) 
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    sendNotificationToUser(userId: string, notification: any) {
        this.server.to(userId).emit('new_notification', notification);
    };
}