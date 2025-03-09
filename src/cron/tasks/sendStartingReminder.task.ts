import { Injectable } from '@nestjs/common';
import { NotificationType } from 'src/enums/notification-type.enum';
import { ReservationsService } from 'src/modules/reservations/reservations.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Injectable()
export class SendStartingReminderTask {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async execute() {
    const now = new Date();
    const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas desde ahora

    const reservations = await this.reservationsService.getReservationsStartingNextDay();

    for (const reservation of reservations) {
      const notification = this.notificationsService.create({
        message: `Your reservation for ${reservation.room.name} starts in less than 24 hours.`,
        type: NotificationType.REMINDER,
        userId: reservation.user.id,
      });
      console.log(`Notification created: Less than 24 hours left for the reservation`);
    }
  };
}
