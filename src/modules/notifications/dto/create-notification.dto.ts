import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationType } from 'src/enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Message content of the notification',
    example: 'Your reservation has been confirmed.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Indicates if the notification has been read',
    example: false,
  })
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({
    description: 'Type of the notification',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'User ID associated with the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}
