import { forwardRef, Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './entities/credential.entity';
import { User } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Credential]), forwardRef(() => AuthModule)],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService]
})
export class CredentialsModule { }