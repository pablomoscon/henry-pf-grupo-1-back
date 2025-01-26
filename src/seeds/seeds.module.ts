import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LocationsSeed } from './locations/locations.seed';
import { UsersSeed } from './users/users.seed';
import { RoomsSeed } from './rooms/rooms.seed';
import { ReservationsSeed } from './reservations/reservations.seed';
import { CredentialsSeed } from './credentials/credentials.seed';
import { Credential } from 'src/modules/credentials/entities/credential.entity';
import { SeedManager } from './seed.manager';
import { LocationsModule } from '../modules/locations/locations.module';
import { Cat } from 'src/modules/cats/entities/cat.entity';
import { CatsSeed } from './cats/cats-seed';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { ReviewsSeed } from './review/reviews-seed';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Room, Reservation, Credential, Cat, Review]),
    LocationsModule, UsersModule
  ],
  providers: [
    SeedManager,
    UsersSeed,
    RoomsSeed,
    LocationsSeed,
    ReservationsSeed,
    CredentialsSeed,
    CatsSeed,
    ReviewsSeed
  ],
  exports: [SeedManager],
})
export class SeedModule { }