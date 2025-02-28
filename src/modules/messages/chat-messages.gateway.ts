import { Socket, Server } from 'socket.io';
import { UsersService } from '../users/users.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ReservationsService } from '../reservations/reservations.service';
import { MessageType } from 'src/enums/message-type';
import { CaretakersService } from '../caretakers/caretakers.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagesService } from './messages.service';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'messages/chat' })
export class MessagesGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly usersService: UsersService,
        private readonly reservationsService: ReservationsService,
        private readonly caretakersService: CaretakersService,
        private readonly messagesService: MessagesService
    ) { }

    handleConnection(socket: Socket) {
        console.log('Client connected:', socket.id);

        const chatRoomId = socket.handshake.query.chatRoomId;
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
        console.log('chatRoomId received:', chatRoomId);

        if (chatRoomId && currentUser) {
            socket.join(chatRoomId);
            socket.data.currentUser = currentUser;

            const messages = await this.messagesService.findChatMessagesByReservationId(chatRoomId);

            const messagesWithUsernames = messages.map(message => ({
                ...message,
                senderName: message.sender.name,
                receiversNames: message.receivers.map(receiver => receiver.name)
            }));

            socket.emit('initial_messages', { messages: messagesWithUsernames, chatRoomName: chatRoomId });

            console.log(`Socket ${socket.id} joined the room: ${chatRoomId} and ${currentUser.id} associated`);
        } else {
            console.error('joinRoom failed: chatRoomId not provided.');
        }
    };

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() createChatDto: CreateChatDto,
        @ConnectedSocket() socket: Socket
    ) {
        try {
            const sender = await this.usersService.findOne(createChatDto.currentUser);
            if (!sender) {
                return this.sendError(socket, 'You are not registered in the system.');
            }

            const reservation = await this.reservationsService.findOne(createChatDto.chatRoom);
            if (!reservation) {
                return this.sendError(socket, 'Reservation not found.');
            }

            const caretakerIds = reservation.caretakers.map(caretaker => caretaker.id);
            const caretakersUsers = await this.caretakersService.findUsersFromCaretakers(caretakerIds);
            const caretakerUserIds = caretakersUsers.map(user => user.id);

            let receiversIds: string[] = [];

            if (sender.id === reservation.user.id) {
                receiversIds = caretakerUserIds;
                console.log("Receivers' user IDs (caretakers):", receiversIds);
            } else if (caretakerUserIds.includes(sender.id)) {
                receiversIds = caretakerUserIds.filter(id => id !== sender.id);
                receiversIds.push(reservation.user.id);
                console.log("Receivers' user IDs (excluding sender, adding reservation user):", receiversIds);
            } else {
                console.log('Sender is neither the reservation user nor a caretaker');
            }

            const receivers = await this.getUsersFromIds(receiversIds);
            console.log("Receivers details:", receivers);

            const newChatMessage = await this.messagesService.createChatMessage({
                body: createChatDto.body,
                sender,
                receivers,
                timestamp: new Date(),
                type: MessageType.CHAT,
                reservation
            });
        } catch (error) {
            console.error('Error sending message:', error);
            this.sendError(socket, 'An error occurred while sending your message.');
        }
    };

    private async getUsersFromIds(userIds: string[]) {
        console.log("Getting users with IDs:", userIds);
        return Promise.all(userIds.map(receiverId => this.usersService.findOne(receiverId)));
    };

    private sendChatMessage(socket: Socket, chatRoomId: string, message: any, receiversIds: string[]) {
        console.log("Sending message to chat room:", chatRoomId);

        socket.to(chatRoomId).emit('receive_message', {
            body: message.body,
            senderName: message.sender.name,
            timestamp: message.timestamp,
        });

        console.log(`Message sent in room: ${chatRoomId} from ${message.sender.name}`);
    };

    private sendError(socket: Socket, message: string) {
        socket.emit('message_error', { message });
    };

    handleDisconnect(socket: Socket) {
        console.log('Client disconnected:', socket.id);
    };
}
