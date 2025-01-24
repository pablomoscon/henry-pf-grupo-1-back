import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: UsersService,

  ) { }

  async create(
    createMessageDto: CreateMessageDto,
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

    const sender = await this.usersService.findOne(createMessageDto.sender);
    const receiver = await this.usersService.findOne(createMessageDto.receiver);

    const newMessage = this.messageRepository.create({
      ...createMessageDto,
      sender,
      receiver,
      media_url: mediaUrl,
    });

    return await this.messageRepository.save(newMessage);
  };

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find();
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
  }
}