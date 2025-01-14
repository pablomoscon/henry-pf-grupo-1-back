import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { CredentialsService } from '../credentials/credentials.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Credential } from '../credentials/entities/credential.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credential]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, CredentialsService],
})
export class AuthModule { }