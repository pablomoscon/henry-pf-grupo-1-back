import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsArray, IsNumber, IsString, IsDate } from 'class-validator';

export class CreateReservationDto {
    @ApiProperty({
        description: 'Identificador del usuario que realiza la reserva',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'Identificador del gato asociado a la reserva',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @IsArray()
    @IsNotEmpty()
    catsIds: string[];

    @ApiProperty({
        description: 'Identificador de la habitación reservada',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsUUID()
    @IsString()
    roomId: string;

    @ApiProperty({
        description: 'Fecha de inicio de la reserva',
        example: '2025-01-17',
    })
    @IsNotEmpty()
    @IsDate()
    checkInDate: Date;

    @ApiProperty({
        description: 'Fecha de fin de la reserva',
        example: '2025-01-20',
    })
    @IsNotEmpty()
    @IsDate()
    checkOutDate: Date;

    @ApiProperty({
        description: 'Costo total de la reserva',
        example: 150.75,
    })
    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @ApiProperty({
        description: 'Caretaker associated with the reservation',
    })
    @IsString()
    @IsUUID()
    caretakerId: string;
}