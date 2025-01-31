import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SendStartingReminderTask } from './tasks/sendStartingReminder.task';
import { SendEndingReminderTask } from './tasks/sendEndingReminder.task';
import { JoinedAnniversaryTask } from './tasks/joinedAnniversary.task';
import { GreetUserTask } from './tasks/greetUser.task';
import { RoomsService } from 'src/modules/rooms/rooms.service';
import { ReservationsService } from 'src/modules/reservations/reservations.service';
import * as moment from 'moment-timezone';

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
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyReminders() {
    await this.sendStartingReminderTask.execute();
    await this.sendEndingReminderTask.execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleAnualTasks() {
    await this.joinedAnniversaryTask.execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateRoomAvailability() {
    console.log('Running room availability update...');
    await this.roomsService.updateAvailability();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCompletedReservations() {
    console.log('Checking for expired reservations...');
    await this.reservationsService.completeExpiredReservations();
  }

  ////////// Ejecución cada X minutos para probar en la demo/////////

  @Cron('*/5 * * * *') // Ejecuta cada 5 minutos
  async handleDemoTask() {
    const now = moment().tz('America/Argentina/Buenos_Aires');

    if (
      now.format('YYYY-MM-DD HH:mm') >= '2025-02-07 22:00' && //aca va la fecha y hora de la demo arg
      now.format('YYYY-MM-DD HH:mm') <= '2025-02-07 23:59' // de esta manera no importa donde corra es hora arg
    ) {
      console.log('Ejecutando en horario correcto (Argentina)');
      await this.sendStartingReminderTask.execute();
      await this.sendEndingReminderTask.execute();
    }
  }

  ////////// Ejecución cada X minutos para probar en la demo/////////

  @Cron('*/3 * * * *') // Ejecuta cada 3 minutos
  async handlePreDemoTask() {
    const now = moment().tz('America/Argentina/Buenos_Aires');

    if (
      now.format('YYYY-MM-DD HH:mm') >= '2025-01-31 22:00' && //aca va la fecha y hora de la demo arg
      now.format('YYYY-MM-DD HH:mm') <= '2025-01-31 23:59' // de esta manera no importa donde corra es hora arg
    ) {
      console.log('Ejecutando en horario correcto (Argentina)');
      await this.sendStartingReminderTask.execute();
      await this.sendEndingReminderTask.execute();
    }
  }

  ////////// Ejecución cada 30 seg para probar nuevas notificaciones/////////

  // @Cron(CronExpression.EVERY_10_SECONDS)
  // async handleTestTasks() {
  //   console.log('Cron 10 seg ejecutándose...');
  //   await this.greetUserTask.execute();
  //   await this.sendStartingReminderTask.execute();
  //   await this.sendEndingReminderTask.execute();
  // }

  ////////// Ejecución test ahora viernes 31/////////

  // @Cron('*/1 * * * *') // Ejecuta cada 1 minuto
  // async handleDemoTask() {
  //   const now = moment().tz('America/Argentina/Buenos_Aires');

  //   if (
  //     now.format('YYYY-MM-DD HH:mm') >= '2025-01-31 18:00' &&
  //     now.format('YYYY-MM-DD HH:mm') <= '2025-01-31 19:45'
  //   ) {
  //     console.log('Ejecutando en horario correcto (Argentina)');
  //     await this.sendStartingReminderTask.execute();
  //     await this.sendEndingReminderTask.execute();
  //   }
  // }
}
