import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, FileUploadService, CloudinaryService, UsersService],
})
export class MessagesModule {}
