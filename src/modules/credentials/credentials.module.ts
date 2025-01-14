import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Credentials } from './entities/credentials.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credentials, User])],
  controllers: [CredentialsController],
  providers: [CredentialsService, UsersService],
})
export class CredentialsModule { }
