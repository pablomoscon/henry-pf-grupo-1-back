import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { NotificationType } from 'src/enums/notification-type.enum';

@Injectable()
export class JoinedAnniversaryTask {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async execute() {
    const users = await this.userRepository.find();

    for (const user of users) {
      const createdAt = new Date(user.createdAt);
      const today = new Date();
      if (
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        today.getFullYear() > createdAt.getFullYear()
      ) {
        const notification = this.notificationRepository.create({
          message: `Hoy celebramos un año juntos, ${user.name}!`,
          type: NotificationType.ANNIVERSARY,
          user: user,
        });
        await this.notificationRepository.save(notification);
        console.log('notificacion de aniversario enviada');
      }
    }
  }
}
