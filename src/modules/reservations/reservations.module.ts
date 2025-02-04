import { forwardRef, Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { UsersModule } from '../users/users.module';
import { CatsModule } from '../cats/cats.module';
import { RoomsModule } from '../rooms/rooms.module';
import { PaymentsModule } from '../payments/payments.module';
import { CaretakersModule } from '../caretakers/caretakers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]),
    forwardRef(() => UsersModule),
    RoomsModule,
    CatsModule,
    FileUploadModule,
    forwardRef(() => CaretakersModule),
    forwardRef(() => PaymentsModule)
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, CloudinaryService],
  exports: [ReservationsService],
})
export class ReservationsModule { }