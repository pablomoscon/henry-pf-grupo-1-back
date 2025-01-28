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

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'messages/chat' })
export class MessagesGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        private readonly usersService: UsersService,
        private readonly reservationsService: ReservationsService,
        private readonly caretakersService: CaretakersService,
    ) { }


    @SubscribeMessage('connect')
    handleConnection(socket: Socket) {
        console.log('Client connected:', socket.id);

        const clientChatRoomId = socket.handshake.query.clientChatRoomId;
        if (clientChatRoomId) {
            socket.join(clientChatRoomId);
            console.log(`Socket ${socket.id} unido a la sala: ${clientChatRoomId}`);
        } else {
            console.error('userClientId no proporcionado al conectar');
        }
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { clientChatRoomId: string, currentUser: any }) {
        const { clientChatRoomId, currentUser } = data;
        console.log('userClientId recibido:', clientChatRoomId);

        if (clientChatRoomId) {
            socket.join(clientChatRoomId);
            socket.data.currentUser = currentUser;
            console.log(`Socket ${socket.id} unido a la sala: ${clientChatRoomId} y currentUser asociado`);
        } else {
            console.error('joinRoom falló: userClientId no proporcionado.');
        }
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() createChatDto: CreateChatDto,
        @ConnectedSocket() socket: Socket
    ) {
        try {
            const sender = await this.usersService.findOne(createChatDto.currentUser);
            if (!sender) {
                console.error('Sender no encontrado');
                return;
            }

            const userClient = await this.usersService.findOne(createChatDto.clientChatRoom);
            if (!userClient) {
                console.error('UserClient no encontrado');
                return;
            }

            const reservation = await this.reservationsService.findOne(userClient.id);
            if (!reservation) {
                console.error('Reserva no encontrada para UserClient');
                return;
            }

            const caretakers = reservation.caretakers;
            const userCaretakers = await Promise.all(
                caretakers.map(caretaker => this.caretakersService.findUserFromCaretaker(caretaker.id))
            );

            let receiversIds = [userClient.id, ...userCaretakers.map(userCaretaker => userCaretaker.id)];

            receiversIds = receiversIds.filter(receiverId => receiverId !== sender.id);

            if (receiversIds.length === 0) {
                console.error('No hay receptores válidos.');
                return;
            }

            const newMessage = this.messageRepository.create({
                body: createChatDto.body,
                sender,
                receivers: await Promise.all(
                    receiversIds.map(receiverId => this.usersService.findOne(receiverId))
                ),
                timestamp: new Date(),
                type: MessageType.CHAT,
            });

            await this.messageRepository.save(newMessage);

            console.log(`Mensaje enviado por ${sender.name}(ID: ${sender.id})`);

            socket.to(userClient.id).emit('receive_message', {
                body: newMessage.body,
                sender: { id: sender.id, username: sender.name },
                timestamp: newMessage.timestamp,
            });

            receiversIds.forEach(receiverId => {
                if (receiverId !== userClient.id) {
                    socket.to(receiverId).emit('receive_message', {
                        body: newMessage.body,
                        sender: { id: sender.id, username: sender.name },
                        timestamp: newMessage.timestamp,
                    });
                }
            });

        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    }

    @SubscribeMessage('disconnect')
    handleDisconnect(socket: Socket) {
        console.log('Client disconnected:', socket.id);
    }
}
