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
    const notification = this.notificationsRepository.create(createNotificationDto);
    const savedNotification = await this.notificationsRepository.save(notification);

    // Sends the notification through WebSocket to the user
    this.notificationsGateway.sendNotificationToUser(savedNotification.user.id, savedNotification);

    return savedNotification;
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
    const updatedNotification = await this.findOne(id);

    // Sends the updated notification through WebSocket to the user
    this.notificationsGateway.sendNotificationToUser(updatedNotification.user.id, updatedNotification);

    return updatedNotification;
  };

  async remove(id: string) {
    const notification = await this.findOne(id);
    notification.deleted_at = new Date();
    const removedNotification = await this.notificationsRepository.save(notification);

    // Sends the removed notification through WebSocket (if necessary)
    this.notificationsGateway.sendNotificationToUser(removedNotification.user.id, removedNotification);

    return removedNotification;
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
    const message = `You have unread messages in chat`;

    // Checks if there is already an unread notification with the same message
    const existingNotification = await this.notificationsRepository.findOne({
      where: { user: { id: userId }, message, isRead: false },
    });

    if (existingNotification) {
      console.log(`User ${userId} already has an unread notificationfor chat ${chatId}`);
      return null;  // If it already exists, no need to create a new one
    }

    // Creates a new notification if none exists
    const notification = this.notificationsRepository.create({
      message,
      user: { id: userId },
      type: NotificationType.CHAT,
      chatId: chatId,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Sends the new notification through WebSocket
    this.notificationsGateway.sendNotificationToUser(userId, savedNotification);

    return savedNotification;
  };

  async markChatNotificationsAsRead(userId: string, chatId: string) {
    await this.notificationsRepository.update(
      { user: { id: userId }, message: `You have unread messages in chat`, isRead: false, chatId: chatId },
      { isRead: true }
    );
  };
}