import { forwardRef, Module } from '@nestjs/common';
import { CaretakersService } from './caretakers.service';
import { CaretakersController } from './caretakers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caretaker } from './entities/caretaker.entity';

import { UsersModule } from '../users/users.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Caretaker]),
    ReservationsModule,
    forwardRef(() => UsersModule)],
  controllers: [CaretakersController],
  providers: [CaretakersService],
  exports:[CaretakersService]
})
export class CaretakersModule {}
