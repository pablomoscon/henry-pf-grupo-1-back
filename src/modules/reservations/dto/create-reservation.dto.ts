import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsDateString, IsOptional, IsDate } from 'class-validator';
import { ReservationStatus } from 'src/enums/reservation-status.enum';

export class CreateReservationDto {
    @ApiProperty({
        description: 'Identificador del usuario que realiza la reserva',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Identificador del gato asociado a la reserva',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @IsUUID()
    @IsNotEmpty()
    catId: string;

    @ApiProperty({
        description: 'Identificador de la habitación reservada',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsUUID()
    roomId: string;

    @ApiProperty({
        description: 'Fecha de inicio de la reserva',
        example: '2025-01-17',
    })
    @IsDate()
    @IsNotEmpty()
    checkInDate: Date;

    @ApiProperty({
        description: 'Fecha de fin de la reserva',
        example: '2025-01-20',
    })
    @IsDate()
    @IsNotEmpty()
    checkOutDate: Date;
}