import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { NotificationType } from 'src/enums/notification-type.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JoinedAnniversaryTask {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,

  ) { }

  async execute() {
    const users = await this.usersService.findAll();  // Obtener todos los usuarios (puedes usar el repositorio directamente si necesitas)

    for (const user of users) {
      const createdAt = new Date(user.createdAt);
      const today = new Date();

      if (
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        today.getFullYear() > createdAt.getFullYear()
      ) {
        // Creamos la notificación con el servicio
        const notification = await this.notificationsService.create({
          message: `Today we celebrate one year together, ${user.name}!`,
          type: NotificationType.ANNIVERSARY,
          userId: user.id,
        });

        console.log('Anniversary notification sent');
      }
    }
  }
}
