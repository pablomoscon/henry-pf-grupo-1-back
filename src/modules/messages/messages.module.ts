import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UsersModule, FileUploadModule, ReservationsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService,  MessagesGateway, CloudinaryService],
})
export class MessagesModule {}
