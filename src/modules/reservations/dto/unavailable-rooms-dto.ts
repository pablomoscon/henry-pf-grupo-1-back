import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, IsUUID } from 'class-validator';

export class UnavailableRoomsDto {
    @ApiProperty({
        description: 'Unique identifier for the room',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsUUID()
    roomId: string;

    @ApiProperty({
        description: 'Check-in date in the format YYYY/MM/DD',
        example: '2025/02/17',
    })
    @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
        message: 'checkInDate must be in the format YYYY/MM/DD',
    })
    checkInDate: string;

    @ApiProperty({
        description: 'Check-out date in the format YYYY/MM/DD',
        example: '2025/02/20',
    })
    @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
        message: 'checkOutDate must be in the format YYYY/MM/DD',
    })
    checkOutDate: string;
}