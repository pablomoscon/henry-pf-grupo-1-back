import { IsString, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from 'src/enums/message-type';

export class CreateMessageDto {


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

    @ApiProperty({
        description: 'ID of the associated reservation (optional)',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        required: false
    })
    @IsUUID()
    @IsOptional()
    reservationId: string;
}
    