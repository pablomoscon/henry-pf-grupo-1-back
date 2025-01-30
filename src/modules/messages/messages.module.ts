import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { MessagesService } from './messages.service';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { UsersModule } from '../users/users.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { MessagesGateway } from './messages.gateway';
import { CaretakersModule } from '../caretakers/caretakers.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User]), FileUploadModule, UsersModule, ReservationsModule, CaretakersModule
  ],
    controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, CloudinaryService],

})
export class MessagesModule { }
