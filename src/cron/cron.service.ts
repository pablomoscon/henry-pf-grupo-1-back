import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SendStartingReminderTask } from './tasks/sendStartingReminder.task';
import { SendEndingReminderTask } from './tasks/sendEndingReminder.task';
import { JoinedAnniversaryTask } from './tasks/joinedAnniversary.task';
import { GreetUserTask } from './tasks/greetUser.task';
import { RoomsService } from 'src/modules/rooms/rooms.service';
import { ReservationsService } from 'src/modules/reservations/reservations.service';

@Injectable()
export class CronService {
  constructor(
    private readonly sendStartingReminderTask: SendStartingReminderTask,
    private readonly sendEndingReminderTask: SendEndingReminderTask,
    private readonly joinedAnniversaryTask: JoinedAnniversaryTask,
    private readonly roomsService: RoomsService,
    private readonly reservationsService: ReservationsService,
    private readonly greetUserTask: GreetUserTask,
  ) {
    console.log('CronService inicializado');
  };

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleDailyReminders() {
    await this.sendStartingReminderTask.execute();
    await this.sendEndingReminderTask.execute();
  };

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleAnualTasks() {
    await this.joinedAnniversaryTask.execute();
  };

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async updateRoomAvailability() {
    console.log('Running room availability update...');
    await this.roomsService.updateAvailability();
  };

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCompletedReservations() {
    console.log('Checking for expired reservations...');
    await this.reservationsService.completeExpiredReservations();
  };

  ////////// Ejecución cada 30 seg para probar nuevas notificaciones/////////

  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async handleTestTasks() {
  //   console.log('Cron ejecutándose...');
  //   await this.greetUserTask.execute();
  //   await this.sendStartingReminderTask.execute();
  //   await this.sendEndingReminderTask.execute();
  //   await this.joinedAnniversaryTask.execute();
  // }
}
