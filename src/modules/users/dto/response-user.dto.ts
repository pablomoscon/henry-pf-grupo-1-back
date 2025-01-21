import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Cat } from 'src/modules/cats/entities/cat.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

export class ResponseUserDto {
    @ApiProperty({
        description: 'The unique identifier of the user',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    id: string;

    @ApiProperty({
        description: 'The name of the user',
        example: 'John Doe',
    })
    name: string;

    @ApiProperty({
        description: 'The email of the user',
        example: 'johndoe@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'The phone number of the user',
        example: '+1234567890',
    })
    phone: string;

    @ApiProperty({
        description: 'Address of the user',
        example: '123 Main St, Springfield',
    })
    address?: string;


    @ApiProperty({
        description: 'Customer ID associated with the user in external systems',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    customerId?: string;

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.phone = user.phone;
        this.address = user.address;
        this.customerId = user.customerId;
    }
}