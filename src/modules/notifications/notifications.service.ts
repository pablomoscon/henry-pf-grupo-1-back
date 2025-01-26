import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return await this.notificationsRepository.save(notification);
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
