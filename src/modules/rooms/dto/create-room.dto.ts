import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({
        description: 'Name of the room',
        example: 'Deluxe Suite',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Image URLs for the rooms',
        example: [
            'https://example.com/room-image.jpg',
            'https://example.com/room-image2.jpg',
        ],
    })
    @IsArray()
    @IsString({ each: true })
    imgs: string[];

    @ApiProperty({
        description: 'Description of the room',
        example: 'A luxurious suite with a sea view.',
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Price of the room',
        example: 150.0,
    })
    @IsNumber()
    price: number;
}
