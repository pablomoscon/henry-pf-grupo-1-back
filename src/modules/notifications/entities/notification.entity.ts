import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from 'src/enums/notification-type.enum';
import { IsOptional } from 'class-validator';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Column()
  @ApiProperty({
    description: 'Message content of the notification',
    example: 'Your reservation has been confirmed.',
  })
  message: string;

  @Column({ default: false })
  @ApiProperty({
    description: 'Indicates if the notification has been read',
    example: false,
  })
  isRead: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  @ApiProperty({
    description: 'Type of the notification',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({
    description: 'Timestamp when the notification was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @ApiProperty({
    description: 'User associated with the notification',
  })
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the notification was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;
}
