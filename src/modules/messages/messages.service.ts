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
      const uploadedFile = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });

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

  async update(id: string, updatePostDto: UpdatePostDto, file?: Express.Multer.File) {
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

  async remove(id: string): Promise<Message> {
    const user = await this.messageRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.deleted_at = new Date();
    return this.messageRepository.save(user);
  };
}
