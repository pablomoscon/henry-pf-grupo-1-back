import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UsersService } from '../users/users.service';
import { ReservationsService } from '../reservations/reservations.service';


@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,
    private readonly reservationsService: ReservationsService,

  ) { }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['sender', 'receivers', 'reservation'],
    });
  };

  async findMessagesByReservationUser(userId: string, userClientId: string): Promise<Message[]> {
    // Obtener las reservas solo para el cliente
    const reservations = await this.reservationsService.findUserReservations(userClientId);

    if (!reservations || reservations.length === 0) {
      console.warn(`No reservations found for client with ID: ${userClientId}`);
      return [];
    }

    const reservationIds = reservations.map(reservation => reservation.id);

    // Obtener los mensajes donde el usuario es tanto sender como receiver, relacionado con las reservas del cliente
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receivers', 'receivers')
      .leftJoinAndSelect('message.reservation', 'reservation')
      .where('message.reservation.id IN (:...reservationIds)', { reservationIds })
      .andWhere(
        '(message.sender.id = :userId OR receivers.id = :userId)',
        { userId }
      )
      .getMany();

    if (messages.length === 0) {
      console.warn(`No messages found for user with ID: ${userId}.`);
    }

    return messages;
  }
  async findOne(id: string): Promise<Message> {
    return this.messageRepository.findOne({ where: { id } });
  };

  async update(id: string, updateMessageDto: UpdateChatDto, file?: Express.Multer.File): Promise<Message> {
    const existingMessage = await this.messageRepository.findOne({ where: { id } });

    if (!existingMessage) {
      throw new Error('Message not found');
    }

    let mediaUrl: string | undefined = existingMessage.media_url;

    if (file) {
      const uploadedFile = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });

      mediaUrl = uploadedFile;
    }

    const updatedMessage = Object.assign(existingMessage, {
      ...updateMessageDto,
      media_url: mediaUrl,
    });

    return this.messageRepository.save(updatedMessage);
  };

  async remove(id: string): Promise<void> {
    await this.messageRepository.delete(id);
  };
}
