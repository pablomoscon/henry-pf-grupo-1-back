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

            const messages = await this.messagesService.findMessagesByReservationUser(currentUser.id, clientChatRoomId)

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
                console.error('Sender not found');
                socket.emit('message_error', { message: 'You currently don’t have any reservations, so chatting isn’t available right now.' });
                console.log('Error sent to frontend');
                return;
            };

            const clientChatRoom = await this.usersService.findOne(createChatDto.clientChatRoom);
            if (!clientChatRoom) {
                console.error('Client not found');
                return;
            };

            let reservation;
            try {
                reservation = await this.reservationsService.findOne(clientChatRoom.id);
            } catch (error) {
                socket.emit('message_error', { message: 'You currently don’t have any reservations, so chatting isn’t available right now.' });
                console.error('Reservation not found for the client');
                return;
            }

            const caretakers = reservation.caretakers.map(caretaker => caretaker.id);
            const userCaretakers = await this.caretakersService.findUsersFromCaretakers(caretakers);

            const isCaretaker = userCaretakers.some(user => user.id === sender.id);
            const isSenderInChatRoom = sender.id === clientChatRoom.id;

            if (!(isCaretaker || isSenderInChatRoom)) {
                console.error('User does not meet the criteria to send messages');
                socket.emit('message_error', { message: 'You do not have permission to send messages in this chat.' });
                return;
            }

            let receiversIds = [clientChatRoom.id, ...userCaretakers.map(userCaretaker => userCaretaker.id)];
            receiversIds = receiversIds.filter(receiverId => receiverId !== sender.id);

            if (receiversIds.length === 0) {
                console.error('No valid receivers.');
                return;
            };

            const newChatMessage = await this.messagesService.createChatMessage({
                body: createChatDto.body,
                sender,
                receivers: await Promise.all(
                    receiversIds.map(receiverId => this.usersService.findOne(receiverId))
                ),
                timestamp: new Date(),
                type: MessageType.CHAT,
                reservation
            });

            console.log(`Message sent by ${sender.name}(ID: ${sender.id})`);

            socket.to(clientChatRoom.id).emit('receive_message', {
                body: newChatMessage.body,
                senderName: sender.name,
                timestamp: newChatMessage.timestamp,
            });

            receiversIds.forEach(receiverId => {
                if (receiverId !== clientChatRoom.id) {
                    socket.to(receiverId).emit('receive_message', {
                        body: newChatMessage.body,
                        senderName: sender.name,
                        timestamp: newChatMessage.timestamp,
                    });
                }
            });

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message_error', { message: 'An error occurred while sending your message. Please try again later.' });
        }
    };

    handleDisconnect(socket: Socket) {
        console.log('Client disconnected:', socket.id);
    };
}
