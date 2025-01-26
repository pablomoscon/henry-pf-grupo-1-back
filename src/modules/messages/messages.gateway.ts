import { Socket, Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ReservationsService } from '../reservations/reservations.service';
import { MessageType } from 'src/enums/message-type';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'messages/chat' })
export class MessagesGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        private readonly usersService: UsersService,
        private readonly reservationsService: ReservationsService
    ) { }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @MessageBody() { userId }: { userId: string },
        @ConnectedSocket() socket: Socket
    ) {
        socket.join(userId);
        console.log(`User ${userId} joined their room.`);
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() createMessageDto: CreateMessageDto,
        @ConnectedSocket() socket: Socket
    ) {
        const sender = await this.usersService.findOne(createMessageDto.sender);

        const reservation = await this.reservationsService.findOne(sender.id);
        if (!reservation) {
            console.error('No reservation found for the sender');
            return;
        }

        let receivers = [];

        if (reservation.user.id === sender.id) {
            
            receivers = Array.isArray(reservation.caretakers) ? reservation.caretakers : [];
        } else if (reservation.caretakers && reservation.caretakers.length > 0) {
            
            const otherCaretaker = reservation.caretakers.find(caretaker => caretaker.id !== sender.id);
            if (otherCaretaker) {
                receivers = [otherCaretaker];
            } else {
                console.error('No other caretaker found for the sender.');
            }
        } else {
            const user = await this.usersService.findOne(reservation.user.id);
            if (user) {
                receivers = [user];
            } else {
                console.error('User not found for ID:', reservation.user.id);
            }
        }
        
        const newMessage = this.messageRepository.create({
            body: createMessageDto.body,
            sender,
            receivers,
            timestamp: new Date(),
            type: MessageType.CHAT,
        });

        await this.messageRepository.save(newMessage);

        if (receivers.length > 0) {
            receivers.forEach((receiver) => {
                this.server.to(receiver.id).emit('receive_message', newMessage);
                console.log('Message sent to receiver:', receiver.id);
            });
        } else {
            console.error('Invalid or empty receivers array:', receivers);
        }
    }

    @SubscribeMessage('connect')
    handleConnection(socket: Socket) {
        console.log('Client connected:', socket.id);
    }

    @SubscribeMessage('disconnect')
    handleDisconnect(socket: Socket) {
        console.log('Client disconnected:', socket.id);
    }
}