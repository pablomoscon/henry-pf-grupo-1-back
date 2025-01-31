import { ApiProperty } from '@nestjs/swagger';
import { RoomFeatures } from '../../../enums/rooms-features.enum';
import { Transform } from 'class-transformer';

export class ResponseRoomDto {
    @ApiProperty({
        description: 'Unique identifier for the room',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the room',
        example: 'Luxury Suite',
    })
    name: string;

    @ApiProperty({
        description: 'Image URL for the room',
        example: 'https://example.com/room-image.jpg',
    })
    img: string;

    @ApiProperty({
        description: 'Description of the room',
        example: 'A comfortable suite...',
    })
    description: string;

    @ApiProperty({
        description: 'Price of the room',
        example: 150.0,
    })
    price: number;

    @ApiProperty({
        description: 'Number of cats in the room',
        example: 2,
    })
    number_of_cats: number;

    @ApiProperty({
        description: 'Features of the room',
        example: ['hidingPlace', 'hammocks'],
    })
    @Transform(({ value }) => value.split(',').map((item: string) => item.trim()), { toClassOnly: true })
    features: string[];

    @ApiProperty({
        description: 'Availability of the room',
        example: true,
    })
    available: boolean;

    @ApiProperty({
        description: 'Timestamp when the room was deleted',
        example: '2025-01-09T00:00:00.000Z',
    })
    deleted_at: Date | null;
}