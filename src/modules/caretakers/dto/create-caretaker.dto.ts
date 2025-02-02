import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDate, IsNotEmpty, IsArray } from 'class-validator';

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
    locationId?: string;

    @ApiProperty({
        description: 'Reservations associated with the caretaker',
        required: false,
    })
    @IsOptional()
    @IsArray()
    reservationsId?: string[];

    @ApiProperty({
        description: 'Timestamp when the caretaker was deleted',
        example: '2025-01-10T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    deleted_at?: Date;
}
