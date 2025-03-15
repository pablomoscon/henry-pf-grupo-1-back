import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from 'src/enums/notification-type.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly usersService: UsersService
  ) { }

  async create(createNotificationDto: CreateNotificationDto) {
    const { userId, ...notificationData } = createNotificationDto;

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const notification = this.notificationsRepository.create({
      ...notificationData,
      user,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    this.notificationsGateway.sendNotificationToUser(savedNotification.user.id, savedNotification);

    return savedNotification;
  }

  async findAll() {
    return await this.notificationsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['user'],
    });
  };

  async findOne(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['user'],
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  };
  
  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    try {
      const notification = await this.findOne(id);

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      await this.notificationsRepository.update(id, updateNotificationDto);
      const updatedNotification = await this.findOne(id);

      // Enviar la notificación actualizada al usuario a través de WebSocket
      this.notificationsGateway.sendNotificationToUser(updatedNotification.user.id, updatedNotification);

      return updatedNotification;
    } catch (error) {
      console.error("Error updating notification:", error); // Registra el error completo para depuración
      throw new InternalServerErrorException(`Failed to update notification: ${error.message}`);
    }
  }

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

  async notifyUnreadChat(userId: string, chatId: string, sender: User): Promise<Notification | null> {
    const message = `You’ve got a message in the chat from ${sender.name}.`

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

  async markNotificationAsRead(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return await this.notificationsRepository.save(notification);
  };
}