import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    },
    namespace: '/messages/posts',
})
@Injectable()
export class PostGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    private connectedUsers: Map<string, string> = new Map(); 

    handleConnection(client: Socket) {
        console.log(`Cliente conectado: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Cliente desconectado: ${client.id}`);
        // Eliminar al usuario desconectado
        this.connectedUsers.forEach((socketId, userId) => {
            if (socketId === client.id) {
                this.connectedUsers.delete(userId);
            }
        });
        this.server.emit('userDisconnected', Array.from(this.connectedUsers.keys()));
    }

    @SubscribeMessage('registerUser')
    handleRegisterUser(client: Socket, userId: string) {
        // Registrar el usuario en el Map
        this.connectedUsers.set(userId, client.id);
        console.log(`Usuario ${userId} registrado con socketId ${client.id}`);
        this.server.emit('userConnected', Array.from(this.connectedUsers.keys()));
    }

    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());  // Devolver lista de userIds conectados
    }
    emitNewPost(message: Message) {
        console.log("Enviando nuevo mensaje:");
        this.server.emit('newPost', message);
    }

}
