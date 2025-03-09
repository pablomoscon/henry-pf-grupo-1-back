import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'messages/notifications' })
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    // When the join message is received, the client is subscribed to their channel
    @SubscribeMessage('join')
    handleJoin(@MessageBody() userId: string, @ConnectedSocket() socket: Socket) {
        console.log(`User ${userId} joined the notifications channel`);
        socket.join(userId);  // The user joins their own channel
    }

    // Sends a notification to the specified user
    sendNotificationToUser(userId: string, notification: any) {
        console.log(`Sending notification to ${userId}`);
        this.server.to(userId).emit('new_notification', notification);  // Emits only to that user
    }
}
