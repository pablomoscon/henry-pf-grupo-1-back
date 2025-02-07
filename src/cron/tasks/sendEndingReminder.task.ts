import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { NotificationType } from 'src/enums/notification-type.enum';

@Injectable()
export class SendEndingReminderTask {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async execute() {
    const now = new Date();
    const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas desde ahora

    const reservations = await this.reservationRepository.find({
      where: { checkOutDate: Between(now, threshold) },
      relations: ['room', 'user'], // Asegúrate de cargar las relaciones necesarias
    });

    for (const reservation of reservations) {
      const notification = this.notificationRepository.create({
        message: `Your reservation for ${reservation.room.name} ends in less than 24 hours.`,
        type: NotificationType.REMINDER,
        user: reservation.user,
      });
      await this.notificationRepository.save(notification);
      console.log(
        `Notification created: Less than 24 hours remaining to complete the reservation.`,
      );
    }
  }
}
