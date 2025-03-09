import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/modules/notifications/notifications.service';  // Asegúrate de importar el servicio de notificaciones
import { NotificationType } from 'src/enums/notification-type.enum';
import { ReservationsService } from 'src/modules/reservations/reservations.service';

@Injectable()
export class SendEndingReminderTask {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly notificationsService: NotificationsService, 
  ) { }

  async execute() {
    const now = new Date();
    const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas desde ahora

    const reservations = await this.reservationsService.getReservationsEndingNextDay()

    for (const reservation of reservations) {
      // Creamos la notificación usando el servicio de notificaciones
      const notification = await this.notificationsService.create({
        message: `Your reservation for ${reservation.room.name} ends in less than 24 hours.`,
        type: NotificationType.REMINDER,
        userId: reservation.user.id,
      });

      console.log(
        `Notification created: Less than 24 hours remaining to complete the reservation.`,
      );
    }
  }
}
