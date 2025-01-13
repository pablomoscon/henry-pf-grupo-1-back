import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersSeed } from './users/users.seed';
import { RoomsSeed } from './rooms/rooms.seed';
import { ReservationsSeed } from './reservations/reservations.seed';
import { CredentialsSeed } from './credentials/credentials.seed';
import { Credential } from 'src/modules/credentials/entities/credential.entity';
import { SeedManager } from './seed.manager';

@Module({
  imports: [TypeOrmModule.forFeature([User, Room, Reservation, Credential])],
  providers: [
    SeedManager,
    UsersSeed,
    RoomsSeed,
    ReservationsSeed,
    CredentialsSeed,
  ],
  exports: [SeedManager],
})
export class SeedModule {}
