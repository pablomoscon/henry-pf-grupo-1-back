import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { GreetUserTask } from './tasks/greetUser.task';
import { SendStartingReminderTask } from './tasks/sendStartingReminder.task';
import { SendEndingReminderTask } from './tasks/sendEndingReminder.task';
import { JoinedAnniversaryTask } from './tasks/joinedAnniversary.task';
import { User } from 'src/modules/users/entities/user.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Activar el módulo de Schedule aquí
    TypeOrmModule.forFeature([User, Notification, Reservation]), // Registrar entidades necesarias
  ],
  providers: [
    CronService,
    GreetUserTask,
    SendStartingReminderTask,
    SendEndingReminderTask,
    JoinedAnniversaryTask,
  ],
})
export class CronsModule {}
