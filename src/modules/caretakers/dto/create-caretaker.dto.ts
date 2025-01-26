import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDate, IsArray } from 'class-validator';

export class CreateCaretakerDto {
    @ApiProperty({
        description: 'Unique identifier for the caretaker',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    id: string;

    @ApiProperty({
        description: 'User who is the caretaker',
        example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Cesar Millan' },
    })
    userId: string;

    @ApiProperty({
        description: 'Profile information of the caretaker',
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    })
    @IsString()
    profileData: string;

    @ApiProperty({
        description: 'Timestamp when the caretaker was deleted',
        example: '2025-01-10T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    deleted_at?: Date;


    @ApiProperty({
        description: 'Reservations associated with the caretaker',
        required: false,
    })
    @IsOptional()
    @IsArray()
    reservationsId: string[];

    @ApiProperty({
        description: 'Location where the caretaker works',
        example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'New York' },
    })
    locationId: string;
}