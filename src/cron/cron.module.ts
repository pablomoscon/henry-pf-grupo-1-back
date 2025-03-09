import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { SendStartingReminderTask } from './tasks/sendStartingReminder.task';
import { SendEndingReminderTask } from './tasks/sendEndingReminder.task';
import { JoinedAnniversaryTask } from './tasks/joinedAnniversary.task';
import { User } from 'src/modules/users/entities/user.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { RoomsModule } from 'src/modules/rooms/rooms.module';
import { ReservationsModule } from 'src/modules/reservations/reservations.module';
import { MailsModule } from 'src/modules/mail/mail.module';
import { UsersModule } from 'src/modules/users/users.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Activar el módulo de Schedule aquí
    TypeOrmModule.forFeature([Reservation]), RoomsModule, ReservationsModule, MailsModule, UsersModule, NotificationsModule
  ],
  providers: [
    CronService,
    SendStartingReminderTask,
    SendEndingReminderTask,
    JoinedAnniversaryTask,
  ],
})
export class CronsModule {}
