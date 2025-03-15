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
        console.log("Socket conectado:", socket.id);
    };
    // Handles the "joinRoom" event, where a user joins a chat room.
    // It checks if the user is already in the room before adding them.
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { chatRoomId: string, currentUser: User }) {
        const { chatRoomId, currentUser } = data;

        // Verify that the required data is provided
        if (!chatRoomId || !currentUser?.id) {
            return this.sendError(socket, 'chatRoomId or currentUser not provided.');
        }

        // Check if the socket is already in the room before joining
        if (!socket.rooms.has(chatRoomId)) {
            // If not in the room, add the socket to the room
            socket.join(chatRoomId);
        } else {
            console.log(`User ${currentUser.id} is already in room: ${chatRoomId}`);
        }

        // Update the status of messages to mark them as read by the user
        await this.updateMessagesStatus(chatRoomId, currentUser.id);

        // Retrieve previous chat messages
        const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);

        // Add sender and receiver names to the messages
        const messagesWithUsernames = messages.map(message => ({
            ...message,
            senderName: message.sender.name,
            receiversNames: message.receivers.map(receiver => receiver.name)
        }));

        // Send the initial messages to the user joining the room
        socket.emit('initial_messages', { messages: messagesWithUsernames, chatRoomName: chatRoomId });
    };

    // Handles sending a chat message from a user
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
            await this.sendUnreadChatNotification(receiversIds, createChatDto.chatRoom, sender);
        } catch (error) {
            console.error('Error sending message:', error);
            this.sendError(socket, 'An error occurred while sending your message.');
        }
    };

    // Returns the IDs of the receivers based on the sender's role
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
            receiversIds: message.receivers.map(receiver => receiver.id),
            type: MessageType.CHAT
        });
    }

    // Sends an error message to the client
    private sendError(socket: Socket, message: string) {
        socket.emit('message_error', { message });
    }

    // Updates the status of messages for the current user
    private async updateMessagesStatus(chatRoomId: string, currentUserId: string): Promise<void> {
        const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);
        const processedMessages = new Set();
        await Promise.all(messages.map(async (message) => {
            if (message.receivers.some(receiver => receiver.id === currentUserId) && !message.isRead && !processedMessages.has(message.id)) {
                await this.messagesService.updateMessageStatus(message.id, currentUserId, true);
                processedMessages.add(message.id);
            }
        }));
    };

    // Updates the message status for all receivers in the chat room
    private async updateMessageStatusForReceivers(chatRoomId: string, receiversIds: string[], newChatMessage: Message) {
        await Promise.all(receiversIds.map(async (receiverId) => {
            const isInRoom = this.chatRooms[chatRoomId]?.has(receiverId);
            if (isInRoom) {
                await this.messagesService.updateMessageStatus(newChatMessage.id, receiverId, true);
            }
        }));
    };

    // Sends a notification to users who haven't read the new message
    private async sendUnreadChatNotification(receiversIds: string[], chatRoomId: string, sender: User) {
        await Promise.all(receiversIds.map(async (receiverId) => {
            const isInRoom = this.chatRooms[chatRoomId]?.has(receiverId);
            if (!isInRoom && !receiversIds.includes(receiverId)) {
                await this.notificationsService.notifyUnreadChat(receiverId, chatRoomId, sender);
            }
        }));
    };


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
