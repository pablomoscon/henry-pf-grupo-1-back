import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
import { NotificationsService } from '../notifications/notifications.service';
import { PostGateway } from './post-messages.gateway';
import { NotificationType } from 'src/enums/notification-type.enum';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { User } from '../users/entities/user.entity';


@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly reservationsService: ReservationsService,
    private postGateway: PostGateway, 
  ) { }

  async createPosts(createPostDto: CreatePostDto, file?: Express.Multer.File): Promise<Message> {
    let mediaUrl: string | undefined;

    // Handle file attachment
    if (file) {
      const supportedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
      if (!supportedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Unsupported file type. Only images and videos are allowed.');
      }
      mediaUrl = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    // Find sender and receivers
    const sender = await this.usersService.findOne(createPostDto.sender);
    const receiverIds = Array.isArray(createPostDto.receiver) ? createPostDto.receiver : [createPostDto.receiver];
    const receivers = await Promise.all(receiverIds.map((id) => this.usersService.findOne(id)));

    if (receivers.some((receiver) => !receiver)) {
      throw new NotFoundException('One or more receivers not found');
    }

    // Check if there is an associated reservation
    const reservation = createPostDto.reservationId
      ? await this.reservationsService.findOne(createPostDto.reservationId)
      : null;

    // Create and save the post with isRead set to false initially
    const newPost = this.messageRepository.create({
      ...createPostDto,
      reservation,
      sender,
      receivers,
      media_url: mediaUrl,
      type: MessageType.POST,
      isRead: false, // The post starts as unread
    });

    await this.messageRepository.save(newPost);

    // Handle receivers' connection status (mark as read or send notifications)
    await this.handleReceiversStatus(receivers, sender, newPost);

    this.postGateway.emitNewPost(newPost);

    return newPost;  // Still return the new post at the end for the caller to use
  };


  // Function to handle connected users and send notifications for disconnected ones
  async handleReceiversStatus(
    receivers: User[],
    sender: User,
    newPost: Message
  ): Promise<void> {
    // Get the list of connected users
    const connectedUserIds = this.postGateway.getConnectedUsers();

    // Check if the receivers are connected
    for (const receiver of receivers) {
      if (connectedUserIds.includes(receiver.id)) {
        // If receiver is connected, mark the post as read
        newPost.isRead = true;  // Mark as read
        await this.messageRepository.save(newPost);  // Update the post with isRead = true
      } else {
        // If receiver is not connected, send a notification
        const createNotificationDto: CreateNotificationDto = {
          message: `${sender.name} made a post. Go to your feed to see it.`,
          isRead: false,
          type: NotificationType.POST,
          userId: receiver.id,
        };

        await this.notificationsService.create(createNotificationDto);
      }
    }
  };

  // Create a new chat message
  async createChatMessage(createChatDto: CreateChatDto): Promise<Message> {
    const newChatMessage = this.messageRepository.create({
      ...createChatDto,
    });
    return this.messageRepository.save(newChatMessage);
  };

  // Find all received post messages for a user
  async findReceivedMessagesByUser(userId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        receivers: { id: userId },
        type: MessageType.POST,
        deleted_at: IsNull(),
      },
      relations: ['sender', 'receivers', 'reservation'],
      order: { timestamp: 'ASC' },
    });
  };

  // Find all messages
  async findAll(): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['sender', 'receivers'],
    });
  };

  // Find a single message by its ID
  async findOne(id: string): Promise<Message> {
    return await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'receivers'],
    });
  };

  // Update an existing post message, optionally with a new file
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

    // Find existing message and handle errors if not found
    const existingMessage = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'receivers'],
    });
    if (!existingMessage) {
      throw new HttpException(`Message with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    // Update sender if provided
    if (updatePostDto.sender) {
      const sender = await this.usersService.findOne(updatePostDto.sender);
      if (!sender) {
        throw new HttpException(`Sender with ID ${updatePostDto.sender} not found`, HttpStatus.NOT_FOUND);
      }
      existingMessage.sender = sender;
    }

    // Update receiver if provided
    if (updatePostDto.receiver) {
      const receiver = await this.usersService.findOne(updatePostDto.receiver);
      if (!receiver) {
        throw new HttpException(`Receiver with ID ${updatePostDto.receiver} not found`, HttpStatus.NOT_FOUND);
      }
      existingMessage.receivers = [receiver]; // Only one receiver
    }

    existingMessage.type = updatePostDto.type ?? existingMessage.type;
    existingMessage.body = updatePostDto.body ?? existingMessage.body;
    existingMessage.media_url = mediaUrl ?? existingMessage.media_url;

    // Save the updated message
    return await this.messageRepository.save(existingMessage);
  };

  // Find messages related to a reservation for a specific user
  async findMessagesByReservationUser(userId: string, userClientId: string): Promise<Message[]> {
    const reservations = await this.reservationsService.findUserReservationsById(userClientId);

    if (!reservations || reservations.length === 0) {
      console.warn(`No reservations found for client with ID: ${userClientId}`);
      return [];
    }

    const reservationIds = reservations.map((reservation) => reservation.id);

    // Optimize database query by joining necessary tables and applying filters
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receivers', 'receivers')
      .leftJoinAndSelect('message.reservation', 'reservation')
      .where('message.reservation.id IN (:...reservationIds)', { reservationIds, deleted_at: IsNull() })
      .andWhere('(message.sender.id = :userId OR receivers.id = :userId)', { userId })
      .andWhere('message.type = :messageType', { messageType: MessageType.POST })
      .getMany();

    if (messages.length === 0) {
      console.warn(`No messages found for user with ID: ${userId}.`);
    }

    return messages;
  };

  // Find chat messages by reservation ID
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
      .getMany();

    if (messages.length === 0) {
      console.warn(`No messages found for reservation ID: ${reservationId}`);
    }

    return messages;
  };

  // Check if a message is unread by a specific receiver
  async findUnreadMessageByReceiver(messageId: string, receiverId: string): Promise<boolean> {
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        isRead: false,
      },
      relations: ['receivers'],
    });

    return message?.receivers.some((receiver) => receiver.id === receiverId) ?? false;
  };

  // Update the read status of a message for a specific user
  async updateMessageStatus(messageId: string, userId: string, isRead: boolean): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['receivers'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Check if the user is a receiver of the message
    const isReceiver = message.receivers.some((receiver) => receiver.id === userId);
    if (!isReceiver) {
      throw new NotFoundException(`User with ID ${userId} is not a receiver of this message`);
    }

    // Update message read status
    await this.messageRepository.update({ id: messageId }, { isRead });

    console.log(`Message ${messageId} marked as ${isRead ? 'read' : 'unread'} by user ${userId}`);
  };

  // Soft delete a message by setting the deleted_at field
  async remove(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    message.deleted_at = new Date();
    return this.messageRepository.save(message);
  };
}
