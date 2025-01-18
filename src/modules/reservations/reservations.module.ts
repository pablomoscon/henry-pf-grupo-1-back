import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { UsersService } from '../users/users.service';
import { CatsService } from '../cats/cats.service';
import { RoomsService } from '../rooms/rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { Cat } from '../cats/entities/cat.entity';
import { Room } from '../rooms/entities/room.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User, Cat, Room]), FileUploadModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, UsersService, CatsService, RoomsService],
})
export class ReservationsModule {}
