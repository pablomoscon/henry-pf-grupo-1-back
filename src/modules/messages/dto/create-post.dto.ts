import { IsString, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from 'src/enums/message-type';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

export class CreatePostDto {

    @ApiProperty({ description: 'Type of the message', example: 'CHAT' })
    @IsEnum(MessageType)
    type: MessageType;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    })
    @IsString()
    @IsOptional()
    body?: string;

    @ApiProperty({ description: 'Sender of the message' })
    @IsUUID()
    sender: string;

    @ApiProperty({ description: 'Receiver of the message' })
    @IsUUID()
    receiver: string;

    @ApiProperty({ description: 'Reservation associated with the message' })
    reservation: Reservation;
}