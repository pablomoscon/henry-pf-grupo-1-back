import { Socket, Server } from 'socket.io';
import { UsersService } from '../users/users.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ReservationsService } from '../reservations/reservations.service';
import { MessageType } from 'src/enums/message-type';
import { CaretakersService } from '../caretakers/caretakers.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagesService } from './messages.service';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Message } from './entities/message.entity';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'messages/chat' })
export class MessagesGateway {
    @WebSocketServer() server: Server;
    private chatRooms: { [chatRoomId: string]: Set<string> } = {};

    constructor(
        private readonly usersService: UsersService,
        private readonly reservationsService: ReservationsService,
        private readonly caretakersService: CaretakersService,
        private readonly messagesService: MessagesService,
        private readonly notificationsService: NotificationsService
    ) { }

    handleConnection(socket: Socket) {
        const { chatRoomId } = socket.handshake.query;
        if (chatRoomId) {
            socket.join(chatRoomId);
            console.log(`Socket ${socket.id} joined the room: ${chatRoomId}`);
        } else {
            console.error('chatRoomId not provided upon connection');
        }
    };

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { chatRoomId: string, currentUser: User }) {
        const { chatRoomId, currentUser } = data;
        if (!chatRoomId || !currentUser) {
            return console.error('joinRoom failed: chatRoomId or currentUser not provided.');
        }

        this.chatRooms[chatRoomId] = this.chatRooms[chatRoomId] || new Set();
        this.chatRooms[chatRoomId].add(currentUser.id);
        socket.join(chatRoomId);
        socket.data.currentUser = currentUser;

        await this.updateMessagesStatus(chatRoomId, currentUser.id);

        const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);
        const messagesWithUsernames = messages.map(message => ({
            ...message,
            senderName: message.sender.name,
            receiversNames: message.receivers.map(receiver => receiver.name)
        }));

        socket.emit('initial_messages', { messages: messagesWithUsernames, chatRoomName: chatRoomId });
        console.log(`Socket ${socket.id} joined the room: ${chatRoomId} and ${currentUser.id} associated`);
    };

    @SubscribeMessage('send_message')
    async handleSendMessage(@MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() socket: Socket) {
        try {
            const sender = await this.usersService.findOne(createChatDto.currentUser);
            if (!sender) return this.sendError(socket, 'You are not registered in the system.');

            const reservation = await this.reservationsService.findOne(createChatDto.chatRoom);
            if (!reservation) return this.sendError(socket, 'Reservation not found.');

            const caretakerIds = reservation.caretakers.map(caretaker => caretaker.id);
            const caretakersUsers = await this.caretakersService.findUsersFromCaretakers(caretakerIds);
            const caretakerUserIds = caretakersUsers.map(user => user.id);

            const receiversIds = this.getReceiversIds(sender.id, reservation, caretakerUserIds);
            const receivers = await this.getUsersFromIds(receiversIds);

            const newChatMessage = await this.messagesService.createChatMessage({
                body: createChatDto.body,
                sender,
                receivers,
                timestamp: new Date(),
                type: MessageType.CHAT,
                reservation
            });

            this.sendChatMessage(socket, createChatDto.chatRoom, newChatMessage, receiversIds);

            await this.updateMessageStatusForReceivers(createChatDto.chatRoom, receiversIds, newChatMessage);
            await this.sendUnreadNotification(receiversIds, createChatDto.chatRoom, newChatMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            this.sendError(socket, 'An error occurred while sending your message.');
        }
    };

    private getReceiversIds(senderId: string, reservation: any, caretakerUserIds: string[]): string[] {
        if (senderId === reservation.user.id) {
            return caretakerUserIds;
        } else if (caretakerUserIds.includes(senderId)) {
            return caretakerUserIds.filter(id => id !== senderId).concat(reservation.user.id);
        }
        return [];
    }

    private getUsersFromIds(userIds: string[]): Promise<User[]> {
        return Promise.all(userIds.map(receiverId => this.usersService.findOne(receiverId)));
    }

    private sendChatMessage(socket: Socket, chatRoomId: string, message: Message, receiversIds: string[]) {
        socket.to(chatRoomId).emit('receive_message', {
            id: message.id,
            body: message.body,
            senderName: message.sender.name,
            timestamp: message.timestamp,
        });
    }

    private sendError(socket: Socket, message: string) {
        socket.emit('message_error', { message });
    }

    private async updateMessagesStatus(chatRoomId: string, currentUserId: string): Promise<void> {
        const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);
        await Promise.all(messages.map(async (message) => {
            if (message.receivers.some(receiver => receiver.id === currentUserId) && !message.isRead) {
                await this.messagesService.updateMessageStatus(message.id, currentUserId, true);
            }
        }));
    }

    private async updateMessageStatusForReceivers(chatRoomId: string, receiversIds: string[], newChatMessage: Message) {
        await Promise.all(receiversIds.map(async (receiverId) => {
            const isInRoom = this.chatRooms[chatRoomId]?.has(receiverId);
            if (isInRoom) {
                await this.messagesService.updateMessageStatus(newChatMessage.id, receiverId, true);
            }
        }));
    }

    private async sendUnreadNotification(receiversIds: string[], chatRoomId: string, message: any) {
        await Promise.all(receiversIds.map(async (receiverId) => {
            const isInRoom = this.chatRooms[chatRoomId]?.has(receiverId);
            if (!isInRoom) {
                await this.notificationsService.notifyUnreadChat(receiverId, chatRoomId);
            }
        }));
    }

    handleDisconnect(socket: Socket) {
        for (const chatRoomId in this.chatRooms) {
            if (this.chatRooms[chatRoomId].has(socket.data.currentUser?.id)) {
                this.chatRooms[chatRoomId].delete(socket.data.currentUser?.id);
                socket.leave(chatRoomId);
            }
        }
    };
}
