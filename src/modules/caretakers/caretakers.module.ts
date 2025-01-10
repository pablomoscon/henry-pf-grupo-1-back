import { Module } from '@nestjs/common';
import { CaretakersService } from './caretakers.service';
import { CaretakersController } from './caretakers.controller';

@Module({
  controllers: [CaretakersController],
  providers: [CaretakersService],
})
export class CaretakersModule {}
