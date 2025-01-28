import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { MessagesService } from './messages.service';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { UsersModule } from '../users/users.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User]), FileUploadModule, UsersModule, ReservationsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, CloudinaryService],
})
export class MessagesModule {}
