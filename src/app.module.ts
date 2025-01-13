import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CaretakersModule } from './modules/caretakers/caretakers.module';
import { CatsModule } from './modules/cats/cats.module';
import { ChatHistoryModule } from './modules/chat-history/chat-history.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { MediaModule } from './modules/media/media.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { UsersModule } from './modules/users/users.module';
import { SeedModule } from './seeds/seeds.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('databaseConfig'),
    }),
    AuthModule,
    RoomsModule,
    CaretakersModule,
    CatsModule,
    ChatHistoryModule,
    CredentialsModule,
    MediaModule,
    ReservationsModule,
    UsersModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
