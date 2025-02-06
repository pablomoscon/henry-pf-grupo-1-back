import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CaretakersModule } from './modules/caretakers/caretakers.module';
import { CatsModule } from './modules/cats/cats.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { UsersModule } from './modules/users/users.module';
import { SeedModule } from './seeds/seeds.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsModule } from './modules/payments/payments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MailsModule } from './modules/mail/mail.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CronsModule } from './cron/cron.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

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
    JwtModule.register({
      global: true,

      signOptions: { expiresIn: '15s' },

      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    RoomsModule,
    CaretakersModule,
    CatsModule,
    CredentialsModule,
    CronsModule,
    ReservationsModule,
    UsersModule,
    SeedModule,

    PaymentsModule,
    MessagesModule,
    MailsModule,
    NotificationsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
