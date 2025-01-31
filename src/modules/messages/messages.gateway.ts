import { Socket, Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
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
        @InjectRepository(Message)
        private readonly usersService: UsersService,
        private readonly reservationsService: ReservationsService,
        private readonly caretakersService: CaretakersService,
        private readonly messagesService: MessagesService,
    ) { }

    @SubscribeMessage('connect')
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
            const sender = await this.usersService.findOne(createChatDto.currentUser);
            if (!sender) {
                console.error('Sender not found');
                return;
            }

            const clientChatRoom = await this.usersService.findOne(createChatDto.clientChatRoom);
            if (!clientChatRoom) {
                console.error('Client not found');
                return;
            }

            const reservation = await this.reservationsService.findOne(clientChatRoom.id);
            if (!reservation) {
                console.error('Reservation not found for the client');
                return;
            }

            const caretakers = reservation.caretakers;
            if (!caretakers || caretakers.length === 0) {
                console.error('No caretakers assigned to this reservation.');
                socket.emit('error', { message: 'No caretakers assigned to this reservation.' });
                return;
            };

            const userCaretakers = await Promise.all(
                caretakers.map(caretaker => this.caretakersService.findUserFromCaretaker(caretaker.id))
            );

            let receiversIds = [clientChatRoom.id, ...userCaretakers.map(userCaretaker => userCaretaker.id)];

            receiversIds = receiversIds.filter(receiverId => receiverId !== sender.id);

            if (receiversIds.length === 0) {
                console.error('No valid receivers.');
                return;
            }

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
        }
    };

    @SubscribeMessage('disconnect')
    handleDisconnect(socket: Socket) {
        console.log('Client disconnected:', socket.id);
    };
}
