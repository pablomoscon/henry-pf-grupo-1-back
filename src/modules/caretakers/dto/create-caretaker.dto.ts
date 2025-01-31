import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDate, IsNotEmpty } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Location } from '../../../modules/locations/entities/location.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

export class CreateCaretakerDto {
    @ApiProperty({
        description: 'User who is the caretaker',
        example: 'Bob Johnson',
    })
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Profile information of the caretaker',
        example: 'Lorem ipsum dolor sit amet...',
    })
    @IsString()
    profileData: string;

    @ApiProperty({
        description: 'Location where the caretaker works',
        example: 'New York',
    })
    @IsUUID()
    locationId: string;

    @ApiProperty({
        description: 'Reservations associated with the caretaker',
        type: [String],
    })
    @IsOptional()
    @IsUUID('all', { each: true })
    reservationIds?: string[];
}
