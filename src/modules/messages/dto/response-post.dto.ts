import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from 'src/enums/message-type';
import { Message } from '../entities/message.entity';

export class MessageResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the message',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'URL of the media (optional)',
        example: 'https://example.com/media.jpg',
        nullable: true,
    })
    media_url?: string;

    @ApiProperty({ description: 'Type of the message', example: 'CHAT' })
    type: MessageType;

    @ApiProperty({
        description: 'Timestamp when the media was uploaded (optional)',
        example: '2025-01-10T00:00:00.000Z',
        nullable: true,
    })
    uploaded_at?: Date;

    @ApiProperty({
        description: 'Timestamp when the media was deleted (optional)',
        example: '2025-01-10T00:00:00.000Z',
        nullable: true,
    })
    deleted_at?: Date;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        nullable: true,
    })
    body?: string;

    @ApiProperty({
        description: 'Timestamp of the message',
        example: '2025-01-10T00:00:00.000Z',
    })
    timestamp: Date;

    @ApiProperty({
        description: 'ID of the sender',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    sender_id: string;

    @ApiProperty({
        description: 'ID of the receiver',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    receiver_id: string;

    @ApiProperty({
        description: 'Reservation ID associated with the message',
    })
    reservationId: string;

    constructor(message: Message) {
        this.id = message.id;
        this.media_url = message.media_url;
        this.type = message.type;
        this.uploaded_at = message.uploaded_at;
        this.body = message.body;
        this.timestamp = message.timestamp;
        this.sender_id = message.sender.id;
        this.receiver_id = message.receivers.map(receiver => receiver.id).join(',');
        this.reservationId = message.reservation.id;
    };
}