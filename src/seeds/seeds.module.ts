import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersSeed } from './users/users.seed';
import { RoomsSeed } from './rooms/rooms.seed';
import { ReservationsSeed } from './reservations/reservations.seed';
import { CredentialsSeed } from './credentials/credentials.seed';
import { SeedManager } from './seed.manager';
import { Credentials } from 'src/modules/credentials/entities/credentials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room, Reservation, Credentials])],
  providers: [
    SeedManager,
    UsersSeed,
    RoomsSeed,
    ReservationsSeed,
    CredentialsSeed,
  ],
  exports: [SeedManager],
})
export class SeedModule { }
