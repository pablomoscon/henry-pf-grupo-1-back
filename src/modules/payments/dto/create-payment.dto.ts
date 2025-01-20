import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {

    @ApiProperty({
        description: 'The currency of the payment',
        example: 'USD',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'The ID of the reservation associated with this payment',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    @IsUUID()
    reservationId: string;

}