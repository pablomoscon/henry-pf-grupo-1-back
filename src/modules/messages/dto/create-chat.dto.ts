import { IsString, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from 'src/enums/message-type';
import { User } from 'src/modules/users/entities/user.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

export class CreateChatDto {


    @ApiProperty({
        description: 'Content of the message',
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    })
    @IsString()
    @IsOptional()
    body?: string;

    @ApiProperty({ description: 'User who is the sender of the message' })
    @IsUUID()
    currentUser: string;

    @ApiProperty({ description: 'Array of users who are the receivers of the message' })
    @IsUUID()
    sender?: User;

    @ApiProperty({ description: 'Unique identifier of the sender' })
    @IsUUID()
    receivers?: User[];

    @ApiProperty({
        description: 'Timestamp of the message',
        example: '2025-01-10T00:00:00.000Z',
    })
    @IsDate()
    timestamp?: Date;

    @ApiProperty({
        description: 'ID of the user client associated with the reservation (optional)',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    @IsUUID()
    @IsOptional()
    clientChatRoom?: string;

    @ApiProperty({ description: 'Type of the message', example: 'CHAT' })
    @IsEnum(MessageType)
    type?: MessageType;

    @ApiProperty({ description: 'Reservation associated with the message' })
    reservation?: Reservation;
}