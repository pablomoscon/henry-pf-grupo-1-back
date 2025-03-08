import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from 'src/enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return await this.notificationsRepository.save(notification);
  };

  async findAll() {
    return await this.notificationsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['user'],
    });
  };

  async findOne(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  };

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    await this.notificationsRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  };

  async remove(id: string) {
    const notification = await this.findOne(id);
    notification.deleted_at = new Date();
    return await this.notificationsRepository.save(notification);
  };

  async getNotificationsByUser(userId: string, page: number, limit: number) {
    const [notifications, total] =
      await this.notificationsRepository.findAndCount({
        where: { user: { id: userId }, deleted_at: IsNull() },
        skip: (page - 1) * limit,
        take: limit,
      });
    return {
      notifications,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  };
 
  async notifyUnreadChat(userId: string, chatId: string): Promise<Notification | null> {
    const message = `You have an unread message in chat`;

    const existingNotification = await this.notificationsRepository.findOne({
      where: { user: { id: userId }, message, isRead: false },
    });

    if (existingNotification) {
      console.log(`User ${userId} already has an unread notification for chat ${chatId}`);
      return null;
    }

    const notification = this.notificationsRepository.create({
      message,
      user: { id: userId },
      type: NotificationType.CHAT,
      chatId: chatId,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    this.notificationsGateway.sendNotificationToUser(userId, savedNotification);

    return savedNotification;
  };
  
  async markChatNotificationsAsRead(userId: string, chatId: string) {
    await this.notificationsRepository.update(
      { user: { id: userId }, message: `You have an unread message in chat`, isRead: false },
      { isRead: true }
    );
  };
  
}
