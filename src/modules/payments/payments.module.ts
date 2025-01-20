import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ReservationsService } from '../reservations/reservations.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Cat } from '../cats/entities/cat.entity';
import { CatsService } from '../cats/cats.service';
import { Room } from '../rooms/entities/room.entity';
import { RoomsService } from '../rooms/rooms.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Reservation, Room, Cat])],
  controllers: [PaymentsController],
  providers: [PaymentsService, ReservationsService, UsersService, RoomsService, CatsService, FileUploadService, CloudinaryService, MailService,
    {
      provide: Stripe,
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        return new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' });
      },
      inject: [ConfigService],
    },
  ],
  exports: [Stripe]
})
export class PaymentsModule { }