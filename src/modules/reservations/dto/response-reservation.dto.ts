import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '../entities/reservation.entity';

export class ReservationResponseDto {
    @ApiProperty({
        description: 'The unique identifier of the reservation',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    id: string;

    @ApiProperty({
        description: 'Check-in date of the reservation',
        example: '2025-01-17',
    })
    checkInDate: Date;

    @ApiProperty({
        description: 'Check-out date of the reservation',
        example: '2025-01-20',
    })
    checkOutDate: Date;

    @ApiProperty({
        description: 'Status of the reservation',
        example: 'PENDING',
    })
    status: string;

    @ApiProperty({
        description: 'The total amount for the reservation',
        example: 300.00,
    })
    totalAmount: number;

    @ApiProperty({
        description: 'The ID of the user making the reservation',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    userId: string;

    @ApiProperty({
        description: 'The ID of the room reserved',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    roomId: string;

    @ApiProperty({
        description: 'The IDs of the cats associated with the reservation',
        example: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
    })
    catIds: string[];
    

    
    constructor(reservation: Reservation) {
        this.id = reservation.id;
        this.checkInDate = reservation.checkInDate;
        this.checkOutDate = reservation.checkOutDate;
        this.status = reservation.status;
        this.userId = reservation.user.id;  
        this.roomId = reservation.room?.id; 
        this.catIds = reservation.cats.map(cat => cat.id); 
        this.totalAmount = reservation.totalAmount;
    }
}