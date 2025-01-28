import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UpdateMessageDto } from './dto/update-chat.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UsersService } from '../users/users.service';
import { ReservationsService } from '../reservations/reservations.service';
import { MessageType } from 'src/enums/message-type';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,
    private readonly reservationsService: ReservationsService,

  ) { }

  async createChat(
    createChatDto: CreateChatDto,
  ): Promise<Message> {
  
    const sender = await this.usersService.findOne(createChatDto.currentUser);

    const newMessage = this.messageRepository.create({
      ...createChatDto,
      sender,
      type: MessageType.CHAT
    });

    return await this.messageRepository.save(newMessage);
  };

  async findMessagesByReservationUser(userId: string): Promise<Message[]> {

    const reservations = await this.reservationsService.findUserReservations(userId);

    if (!reservations || reservations.length === 0) {
      console.warn(`No se encontraron reservas para el usuario con ID: ${userId}`);
      return [];
    }

    const messages = reservations.flatMap((reservation) => reservation.messages);

    return messages;
  };

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['sender', 'receivers'],
    });
  }

  async findOne(id: string): Promise<Message> {
    return this.messageRepository.findOne({ where: { id } });
  }

  async update(id: string, updateMessageDto: UpdateMessageDto, file?: Express.Multer.File): Promise<Message> {
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
