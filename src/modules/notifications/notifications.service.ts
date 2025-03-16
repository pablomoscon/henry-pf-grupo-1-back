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

    // Use the helper method to check or update existing notification before creating
    const existingNotification = await this.updateUnreadNotification(userId, notificationData.message);

    if (existingNotification) {
      // Return updated notification if already exists
      this.notificationsGateway.sendNotificationToUser(userId, existingNotification);
      return existingNotification;
    }

    // If no existing notification, create a new one
    const notification = this.notificationsRepository.create({
      ...notificationData,
      user,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

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

      return updatedNotification;
    } catch (error) {
      console.error("Error updating notification:", error); // Registra el error completo para depuración
      throw new InternalServerErrorException(`Failed to update notification: ${error.message}`);
    }
  };

 async updateUnreadNotification(userId: string, message: string): Promise<Notification | null> {
    // Check if there's an existing unread notification with the same message and chatId
    const existingNotification = await this.notificationsRepository.findOne({
      where: { 
        user: { id: userId }, 
        message
      },
      relations: ['user'],
    });

    if (existingNotification) {
      // If it exists, mark it as unread and update the timestamp
      existingNotification.isRead = false;
      existingNotification.updatedAt = new Date(); // Update the last updated time
      return await this.notificationsRepository.save(existingNotification); // Save and return updated notification
    }

    return null; // Return null if no existing notification is found
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

  async notifyUnreadChat(userId: string, chatId: string, sender: User): Promise<Notification | null> {
    const message = `You’ve got a message in the chat from ${sender.name}.`;

    // Use the helper method to find or update existing unread notification
    const existingNotification = await this.updateUnreadNotification(userId, message);

    if (existingNotification) {
      // Send the updated notification if it was found and updated
      this.notificationsGateway.sendNotificationToUser(userId, existingNotification);
      return existingNotification;
    }

    // If no existing notification, create a new one
    const notification = this.notificationsRepository.create({
      message,
      user: { id: userId },
      type: NotificationType.CHAT,
      chatId,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Send the new notification
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