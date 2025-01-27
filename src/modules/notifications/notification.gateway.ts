import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway(3030, { cors: true })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly connectedClients: Map<string, string> = new Map(); // socketId -> userId
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
  ) {
    console.log('notificationsService:', notificationsService);
    console.log('authService:', authService);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    this.logger.log(`Conexión recibida con token: ${token}`);

    try {
      const userId = await this.authService.extractUserIdFromToken(token);
      this.logger.log(`Usuario con token ${token} es: ${userId}`);

      if (userId) {
        this.connectedClients.set(client.id, userId);
        this.logger.log(`Usuario conectado: ${userId} (Socket: ${client.id})`);
      } else {
        this.logger.log(
          `Usuario no autenticado. Desconectando socket ${client.id}`,
        );
        client.disconnect();
      }
    } catch (err) {
      this.logger.error('Error al conectar notification gateway:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      this.logger.log(`Usuario desconectado: ${userId} (Socket: ${client.id})`);
      this.connectedClients.delete(client.id);
    } else {
      this.logger.log(
        `Cliente desconectado sin usuario asociado: ${client.id}`,
      );
    }
  }

  async sendNotification(userId: string, message: string) {
    const socketId = [...this.connectedClients.entries()].find(
      ([_, id]) => id === userId,
    )?.[0];

    this.logger.log(
      `Enviando notificación a usuario: ${userId} con mensaje: ${message}`,
    );

    if (socketId) {
      const client = this.server.sockets.sockets.get(socketId);
      if (client) {
        client.emit('new-notification', { message });
        this.logger.log(`Notificación enviada a usuario ${userId}: ${message}`);
      } else {
        this.logger.log(`No se encontró cliente para el usuario ${userId}`);
      }
    } else {
      this.logger.log(`No se encontró socketId para el usuario ${userId}`);
    }
  }

  // Escucha mensajes desde el cliente si necesitas (opcional)
  @SubscribeMessage('get-unread-notifications')
  async handleGetUnreadNotifications(
    client: Socket,
    @MessageBody() userId: string,
  ) {
    this.logger.log(
      `Recibiendo solicitud de notificaciones no leídas para usuario ${userId}`,
    );
    const notifications =
      await this.notificationsService.getUnreadNotifications(userId);
    client.emit('unread-notifications', notifications);
    this.logger.log(
      `Notificaciones enviadas para ${userId}: ${notifications.length}`,
    );
  }
}
