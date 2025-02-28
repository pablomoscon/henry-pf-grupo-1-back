import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UsersService } from '../users/users.service';
import { MessageType } from 'src/enums/message-type';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ReservationsService } from '../reservations/reservations.service';
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

  async createPosts(
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<Message> {
    let mediaUrl: string | undefined;

    if (file) {
      const fileDetails = {
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };

      const supportedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
      if (!supportedMimeTypes.includes(fileDetails.mimeType)) {
        throw new Error('Unsupported file type. Only images and videos are allowed.');
      }

      const uploadedFile = await this.fileUploadService.uploadFile(fileDetails);

      mediaUrl = uploadedFile; 
    }

    const sender = await this.usersService.findOne(createPostDto.sender);
    const receiverIds = Array.isArray(createPostDto.receiver)
      ? createPostDto.receiver
      : [createPostDto.receiver];

    const receivers = await Promise.all(
      receiverIds.map((receiverId) => this.usersService.findOne(receiverId)),
    );

    if (receivers.some((receiver) => !receiver)) {
      throw new Error('One or more receivers not found');
    }

    
    let reservation = null;
    if (createPostDto.reservationId) {
      reservation = await this.reservationsService.findOne(createPostDto.reservationId);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
    }

    const newPost = this.messageRepository.create({
      ...createPostDto,
      reservation,
      sender,
      receivers,
      media_url: mediaUrl,
      type: MessageType.POST
    });

    return await this.messageRepository.save(newPost);
  };

  async createChatMessage(createChatDto: CreateChatDto): Promise<Message> {
    const newChatMessage = this.messageRepository.create({
      ...createChatDto
    });
    return this.messageRepository.save(newChatMessage);
  };

  async findReceivedMessagesByUser(userId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        receivers: { id: userId },
        type: MessageType.POST,
        deleted_at: IsNull()
      },
      relations: ['sender', 'receivers', 'reservation'],
      order: { timestamp: 'ASC' },
    });
  };

  async findAll() {
    return await this.messageRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['sender', 'receivers'],
    });
  };

  async findOne(id: string) {
    return await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'receivers'],
    });
  };

  async updatePost(id: string, updatePostDto: UpdatePostDto, file?: Express.Multer.File) {
    let mediaUrl: string | undefined;

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

    const existingMessage = await this.messageRepository.findOne({ where: { id }, relations: ['sender', 'receivers'] });
    if (!existingMessage) {
      throw new HttpException(`Message with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    if (updatePostDto.sender) {
      const sender = await this.usersService.findOne(updatePostDto.sender);
      if (!sender) {
        throw new HttpException(`Sender with ID ${updatePostDto.sender} not found`, HttpStatus.NOT_FOUND);
      }
      existingMessage.sender = sender;
    }

    if (updatePostDto.receiver) {
      const receiver = await this.usersService.findOne(updatePostDto.receiver);
      if (!receiver) {
        throw new HttpException(`Receiver with ID ${updatePostDto.receiver} not found`, HttpStatus.NOT_FOUND);
      }
      existingMessage.receivers = [receiver];  // Solo un receptor
    }

    existingMessage.type = updatePostDto.type ?? existingMessage.type;
    existingMessage.body = updatePostDto.body ?? existingMessage.body;
    existingMessage.media_url = mediaUrl ?? existingMessage.media_url;

    return await this.messageRepository.save(existingMessage);
  };

  async findMessagesByReservationUser(userId: string, userClientId: string): Promise<Message[]> {

    const reservations = await this.reservationsService.findUserReservationsById(userClientId);

    if (!reservations || reservations.length === 0) {
      console.warn(`No reservations found for client with ID: ${userClientId}`);
      return [];
    }

    const reservationIds = reservations.map(reservation => reservation.id);

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receivers', 'receivers')
      .leftJoinAndSelect('message.reservation', 'reservation')
      .where('message.reservation.id IN (:...reservationIds)', { reservationIds, deleted_at: IsNull() })
      .andWhere(
        '(message.sender.id = :userId OR receivers.id = :userId)',
        { userId }
    )
      
      .andWhere('message.type = :messageType', { messageType: MessageType.POST })
      .getMany();

    if (messages.length === 0) {
      console.warn(`No messages found for user with ID: ${userId}.`);
    }

    return messages;
  };

  async findChatMessagesByReservationId(reservationId: string): Promise<Message[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receivers', 'receivers')
      .leftJoinAndSelect('message.reservation', 'reservation')
      .where('reservation.id = :reservationId', { reservationId })
      .andWhere('message.deleted_at IS NULL')
      .andWhere('message.type = :messageType', { messageType: MessageType.CHAT })
      .orderBy('message.timestamp', 'ASC')
      .getMany()
    
    if (messages.length === 0) {
      console.warn(`No messages found for reservation ID: ${reservationId}`);
    }

    return messages;
  };

  async remove(id: string): Promise<Message> {
    const user = await this.messageRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.deleted_at = new Date();
    return this.messageRepository.save(user);
  };
}
