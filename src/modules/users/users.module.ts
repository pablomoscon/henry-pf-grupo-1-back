import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CaretakersModule } from '../caretakers/caretakers.module';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
    forwardRef(() => CaretakersModule),
    forwardRef(() => CredentialsModule)
],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
