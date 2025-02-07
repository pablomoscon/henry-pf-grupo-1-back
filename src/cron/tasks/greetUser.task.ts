import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { NotificationType } from 'src/enums/notification-type.enum';

@Injectable()
export class GreetUserTask {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async execute() {
    const user = await this.userRepository.findOne({
      where: { name: 'John Williams' },
    });

    if (user) {
      const notification = this.notificationRepository.create({
        message: `Hello, ${user.name}!`,
        type: NotificationType.POST, // Puedes usar el tipo que prefieras
        user: user,
      });
      await this.notificationRepository.save(notification);

      // Log para verificar que la notificación se ha creado
      console.log(`Notificación creada: Hello, ${user.name}!`);
    } else {
      // Log si no se encuentra el usuario
      console.log('Usuario "John Williams" no encontrado.');
    }
  }
}
