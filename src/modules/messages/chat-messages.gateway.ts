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

    // Handle new connections: join the specified chat room
    handleConnection(socket: Socket) {
        const { chatRoomId } = socket.handshake.query;
        if (chatRoomId) {
            socket.join(chatRoomId);
            console.log(`Socket ${socket.id} joined the room: ${chatRoomId}`);
        } else {
            console.error('chatRoomId not provided upon connection');
        }
    };

    // Handles joining a specific chat room and sending initial messages
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { chatRoomId: string, currentUser: User }) {
        const { chatRoomId, currentUser } = data;
        if (!chatRoomId || !currentUser) {
            return console.error('joinRoom failed: chatRoomId or currentUser not provided.');
        }

        // Add the user to the chat room and store in chatRooms
        this.chatRooms[chatRoomId] = this.chatRooms[chatRoomId] || new Set();
        this.chatRooms[chatRoomId].add(currentUser.id);
        socket.join(chatRoomId);
        socket.data.currentUser = currentUser;

        // Update the message status for the current user
        await this.updateMessagesStatus(chatRoomId, currentUser.id);

        // Fetch the initial chat messages for the room
        const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);
        const messagesWithUsernames = messages.map(message => ({
            ...message,
            senderName: message.sender.name,
            receiversNames: message.receivers.map(receiver => receiver.name)
        }));

        // Send initial messages to the user who joined the room
        socket.emit('initial_messages', { messages: messagesWithUsernames, chatRoomName: chatRoomId });
        console.log(`Socket ${socket.id} joined the room: ${chatRoomId} and ${currentUser.id} associated`);
    };

    // Handles sending a chat message from a user
    @SubscribeMessage('send_message')
    async handleSendMessage(@MessageBody() createChatDto: CreateChatDto, @ConnectedSocket() socket: Socket) {
        try {
            const sender = await this.usersService.findOne(createChatDto.currentUser);
            if (!sender) return this.sendError(socket, 'You are not registered in the system.');

            const reservation = await this.reservationsService.findOne(createChatDto.chatRoom);
            if (!reservation) return this.sendError(socket, 'Reservation not found.');

            // Get the caretakers associated with the reservation
            const caretakerIds = reservation.caretakers.map(caretaker => caretaker.id);
            const caretakersUsers = await this.caretakersService.findUsersFromCaretakers(caretakerIds);
            const caretakerUserIds = caretakersUsers.map(user => user.id);

            // Determine the receivers of the message based on the sender's role
            const receiversIds = this.getReceiversIds(sender.id, reservation, caretakerUserIds);
            const receivers = await this.getUsersFromIds(receiversIds);

            // Create and send the chat message
            const newChatMessage = await this.messagesService.createChatMessage({
                body: createChatDto.body,
                sender,
                receivers,
                timestamp: new Date(),
                type: MessageType.CHAT,
                reservation
            });

            // Send the message to the chat room
            this.sendChatMessage(socket, createChatDto.chatRoom, newChatMessage, receiversIds);

            // Update message status for the receivers
            await this.updateMessageStatusForReceivers(createChatDto.chatRoom, receiversIds, newChatMessage);
            // Notify users who haven't read the message
            await this.sendUnreadNotification(receiversIds, createChatDto.chatRoom, newChatMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            this.sendError(socket, 'An error occurred while sending your message.');
        }
    };

    // Returns the IDs of the receivers based on the sender's role (user or caretaker)
    private getReceiversIds(senderId: string, reservation: any, caretakerUserIds: string[]): string[] {
        if (senderId === reservation.user.id) {
            return caretakerUserIds;
        } else if (caretakerUserIds.includes(senderId)) {
            return caretakerUserIds.filter(id => id !== senderId).concat(reservation.user.id);
        }
        return [];
    }

    // Fetches user data based on the provided user IDs
    private getUsersFromIds(userIds: string[]): Promise<User[]> {
        return Promise.all(userIds.map(receiverId => this.usersService.findOne(receiverId)));
    }

    // Sends the chat message to the specified chat room
    private sendChatMessage(socket: Socket, chatRoomId: string, message: Message, receiversIds: string[]) {
        socket.to(chatRoomId).emit('receive_message', {
            id: message.id,
            body: message.body,
            senderName: message.sender.name,
            timestamp: message.timestamp,
        });
    }

    // Sends an error message to the client
    private sendError(socket: Socket, message: string) {
        socket.emit('message_error', { message });
    }

    // Updates the status of messages for the current user when they join the chat room
    private async updateMessagesStatus(chatRoomId: string, currentUserId: string): Promise<void> {
        const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);
        await Promise.all(messages.map(async (message) => {
            if (message.receivers.some(receiver => receiver.id === currentUserId) && !message.isRead) {
                await this.messagesService.updateMessageStatus(message.id, currentUserId, true);
            }
        }));
    }

    // Updates the message status for all receivers in the chat room
    private async updateMessageStatusForReceivers(chatRoomId: string, receiversIds: string[], newChatMessage: Message) {
        await Promise.all(receiversIds.map(async (receiverId) => {
            const isInRoom = this.chatRooms[chatRoomId]?.has(receiverId);
            if (isInRoom) {
                await this.messagesService.updateMessageStatus(newChatMessage.id, receiverId, true);
            }
        }));
    }

    // Sends a notification to users who haven't read the new message in the chat room
    private async sendUnreadNotification(receiversIds: string[], chatRoomId: string, message: any) {
        await Promise.all(receiversIds.map(async (receiverId) => {
            const isInRoom = this.chatRooms[chatRoomId]?.has(receiverId);
            if (!isInRoom) {
                await this.notificationsService.notifyUnreadChat(receiverId, chatRoomId);
            }
        }));
    }

    // Handle disconnections: remove the user from the chat room
    handleDisconnect(socket: Socket) {
        for (const chatRoomId in this.chatRooms) {
            if (this.chatRooms[chatRoomId].has(socket.data.currentUser?.id)) {
                this.chatRooms[chatRoomId].delete(socket.data.currentUser?.id);
                socket.leave(chatRoomId);
            }
        }
    };
}
