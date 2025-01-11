import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersSeed } from './users/users.seed';
import { RoomsSeed } from './rooms/rooms.seed';
import { ReservationsSeed } from './reservations/reservations.seed';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room, Reservation])],
  providers: [UsersSeed, RoomsSeed, ReservationsSeed],
  exports: [UsersSeed, RoomsSeed, ReservationsSeed],
})
export class SeedModule {}
