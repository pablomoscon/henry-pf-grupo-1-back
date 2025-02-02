import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Credential } from '../credentials/entities/credential.entity';
import { UsersModule } from '../users/users.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { MailsModule } from '../mail/mail.module';
import { CredentialsService } from '../credentials/credentials.service';
import { CaretakersModule } from '../caretakers/caretakers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credential]), UsersModule, MailsModule, CaretakersModule, forwardRef(() => CredentialsModule) 
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[AuthService]
})
export class AuthModule { }