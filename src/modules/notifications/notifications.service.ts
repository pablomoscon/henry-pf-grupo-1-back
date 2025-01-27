import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    // private readonly notificationsRepository: Repository<Notification>,
    // private readonly notificationGateway: NotificationGateway,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationGateway)) // Usa forwardRef aquí
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    const savedNotification =
      await this.notificationsRepository.save(notification);

    // Enviar la notificación en tiempo real
    this.notificationGateway.sendNotification(
      createNotificationDto.userId,
      createNotificationDto.message,
    );

    return savedNotification;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    return await this.notificationsRepository.save(notification);
  }

  async findAll() {
    return await this.notificationsRepository.find({
      where: { deleted_at: null },
    });
  }

  async findOne(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, deleted_at: null },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: Partial<CreateNotificationDto>,
  ) {
    await this.notificationsRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const notification = await this.findOne(id);
    notification.deleted_at = new Date();
    return await this.notificationsRepository.save(notification);
  }

  async getUnreadNotifications(userId: string) {
    return await this.notificationsRepository.find({
      where: { user: { id: userId }, isRead: false, deleted_at: null },
    });
  }
}
