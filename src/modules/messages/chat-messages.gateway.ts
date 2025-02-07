import { Socket, Server } from 'socket.io';
import { UsersService } from '../users/users.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ReservationsService } from '../reservations/reservations.service';
import { MessageType } from 'src/enums/message-type';
import { CaretakersService } from '../caretakers/caretakers.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagesService } from './messages.service';

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

        const clientChatRoomId = socket.handshake.query.clientChatRoomId;
        if (clientChatRoomId) {
            socket.join(clientChatRoomId);
            console.log(`Socket ${socket.id} joined the room: ${clientChatRoomId}`);
        } else {
            console.error('clientChatRoomId not provided upon connection');
        }
    };

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { clientChatRoomId: string, currentUser: any }) {
        const { clientChatRoomId, currentUser } = data;
        console.log('clientChatRoomId received:', clientChatRoomId);

        if (clientChatRoomId && currentUser) {
            socket.join(clientChatRoomId);
            socket.data.currentUser = currentUser;

            const messages = await this.messagesService.findChatMessagesByReservationUser(currentUser.id, clientChatRoomId)

            const messagesWithUsernames = messages.map(message => ({
                ...message,
                senderName: message.sender.name,
                receiversNames: message.receivers.map(receiver => receiver.name)
            }));

            socket.emit('initial_messages', { messages: messagesWithUsernames, chatRoomName: clientChatRoomId });

            console.log(`Socket ${socket.id} joined the room: ${clientChatRoomId} and ${currentUser.id} associated`);
        } else {
            console.error('joinRoom failed: clientChatRoomId not provided.');
        }
    };

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() createChatDto: CreateChatDto,
        @ConnectedSocket() socket: Socket
    ) {
        try {
            console.log('createChatDto.currentUser:', createChatDto.currentUser);

            const sender = await this.usersService.findOne(createChatDto.currentUser);
            if (!sender) {
                return this.sendError(socket, 'You are not registered in the system. Please create an account to access the chat feature.');
            }

            const clientChatRoom = await this.usersService.findOne(createChatDto.clientChatRoom);
            if (!clientChatRoom) {
                return this.sendError(socket, 'Client not found.');
            }

            let reservations;
            try {
                reservations = await this.reservationsService.findUserReservationsById(clientChatRoom.id);
            } catch (error) {
                return this.sendError(socket, 'You currently don’t have any reservations, so chatting isn’t available right now.');
            }

            if (!reservations || reservations.length === 0) {
                return this.sendError(socket, 'No reservations found for this client.');
            }

            const allCaretakers = reservations.flatMap(reservation => reservation.caretakers.map(caretaker => caretaker.id));

            if (allCaretakers.length === 0) {
                return this.sendError(socket, 'Chat is not available right now because you don’t have a caretaker assigned. You will be able to send messages soon.');
            }

            let userCaretakers;
            try {
                userCaretakers = await this.caretakersService.findUsersFromCaretakers(allCaretakers);
            } catch (error) {
                return this.sendError(socket, 'Chat is not available right now because you don’t have a caretaker assigned. You will be able to send messages soon.');
            }

            await Promise.all(reservations.map(async (reservationData) => {
                const caretakers = reservationData.caretakers.map(caretaker => caretaker.id);
                const isCaretaker = userCaretakers.some(user => user.id === sender.id);
                const isSenderInChatRoom = sender.id === clientChatRoom.id;

                if (!(isCaretaker || isSenderInChatRoom)) {
                    return this.sendError(socket, 'You do not have permission to send messages in this chat.');
                }

                const receiversIds = this.getReceiversIds(clientChatRoom.id, userCaretakers, sender.id);
                if (receiversIds.length === 0) {
                    return this.sendError(socket, 'No valid receivers.');
                }

                const newChatMessage = await this.messagesService.createChatMessage({
                    body: createChatDto.body,
                    sender,
                    receivers: await this.getUsersFromIds(receiversIds),
                    timestamp: new Date(),
                    type: MessageType.CHAT,
                    reservation: reservationData
                });

                this.sendChatMessage(socket, clientChatRoom.id, newChatMessage, receiversIds);
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            this.sendError(socket, 'An error occurred while sending your message. Please try again later.');
        }
    };

    private sendError(socket: Socket, message: string) {
        socket.emit('message_error', { message });
    };

    private getReceiversIds(clientChatRoomId: string, userCaretakers: any[], senderId: string) {
        return [clientChatRoomId, ...userCaretakers.map(user => user.id)].filter(receiverId => receiverId !== senderId);
    };

    private async getUsersFromIds(userIds: string[]) {
        return Promise.all(userIds.map(receiverId => this.usersService.findOne(receiverId)));
    };

    private sendChatMessage(socket: Socket, chatRoomId: string, message: any, receiversIds: string[]) {
        socket.to(chatRoomId).emit('receive_message', {
            body: message.body,
            senderName: message.sender.name,
            timestamp: message.timestamp,
        });

        receiversIds.forEach(receiverId => {
            if (receiverId !== chatRoomId) {
                socket.to(receiverId).emit('receive_message', {
                    body: message.body,
                    senderName: message.sender.name,
                    timestamp: message.timestamp,
                });
            }
        });
    };

    handleDisconnect(socket: Socket) {
        console.log('Client disconnected:', socket.id);
    };
}
