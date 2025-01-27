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

@WebSocketGateway({ cors: true })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly connectedClients: Map<string, string> = new Map(); // socketId -> userId
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    @Inject(forwardRef(() => NotificationsService)) // Usa forwardRef aquí también
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
  ) {
    console.log('notificationsService:', notificationsService);
    console.log('authService:', authService);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    try {
      // Usa el AuthService para validar el token y extraer el userId
      const userId = await this.authService.extractUserIdFromToken(token);

      if (userId) {
        this.connectedClients.set(client.id, userId);
        this.logger.log(`Usuario conectado: ${userId} (Socket: ${client.id})`);
      } else {
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
    }
  }

  // Método para enviar notificaciones en tiempo real
  async sendNotification(userId: string, message: string) {
    const socketId = [...this.connectedClients.entries()].find(
      ([_, id]) => id === userId,
    )?.[0];

    if (socketId) {
      const client = this.server.sockets.sockets.get(socketId);
      if (client) {
        client.emit('new-notification', { message });
        this.logger.log(`Notificación enviada a usuario ${userId}: ${message}`);
      }
    }
  }

  // Escucha mensajes desde el cliente si necesitas (opcional)
  @SubscribeMessage('get-unread-notifications')
  async handleGetUnreadNotifications(
    client: Socket,
    @MessageBody() userId: string,
  ) {
    const notifications =
      await this.notificationsService.getUnreadNotifications(userId);
    client.emit('unread-notifications', notifications);
  }

  // Utilidad para extraer userId desde el token
  private validateAndExtractUserId(token: string): string {
    // Implementa la validación JWT (usando algún servicio como authService.verifyToken)
    // Retorna el userId si es válido
    return 'decodedUserId'; // Placeholder
  }
}
