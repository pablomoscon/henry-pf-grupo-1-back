import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Credential } from '../credentials/entities/credential.entity';
import { UsersModule } from '../users/users.module';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credential]), UsersModule, CredentialsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }