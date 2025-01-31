import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SendStartingReminderTask } from './tasks/sendStartingReminder.task';
import { SendEndingReminderTask } from './tasks/sendEndingReminder.task';
import { JoinedAnniversaryTask } from './tasks/joinedAnniversary.task';
import { GreetUserTask } from './tasks/greetUser.task';

@Injectable()
export class CronService {
  constructor(
    private readonly sendStartingReminderTask: SendStartingReminderTask,
    private readonly sendEndingReminderTask: SendEndingReminderTask,
    private readonly joinedAnniversaryTask: JoinedAnniversaryTask,
    private readonly greetUserTask: GreetUserTask,
  ) {
    console.log('CronService inicializado');
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleDailyReminders() {
    await this.sendStartingReminderTask.execute();
    await this.sendEndingReminderTask.execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleAnualTasks() {
    await this.joinedAnniversaryTask.execute();
  }

  ////////// Ejecución cada 30 seg para probar nuevas notificaciones/////////

  // @Cron(CronExpression.EVERY_10_SECONDS)
  // async handleTestTasks() {
  //   console.log('Cron ejecutándose...');
  //   await this.greetUserTask.execute();
  // }
}
