import { Module } from '@nestjs/common';
import { CaretakersService } from './caretakers.service';
import { CaretakersController } from './caretakers.controller';
import { Caretaker } from './entities/caretaker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { LocationsModule } from '../locations/locations.module';

@Module({

  imports: [TypeOrmModule.forFeature([Caretaker]), UsersModule, ReservationsModule, LocationsModule],
  controllers: [CaretakersController],
  providers: [CaretakersService],
  exports: [CaretakersService]
})
export class CaretakersModule {}
