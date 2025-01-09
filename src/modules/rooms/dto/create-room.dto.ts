import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({
        description: 'Name of the room',
        example: 'Deluxe Suite'
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Images URLs for the room',
        example: ['https://example.com/product-image.jpg', 'https://example.com/product-image2.jpg'],
    })
    @IsArray()
    @IsString({ each: true })
    imgs: string[];

    @ApiProperty({
        description: 'Description of the room',
        example: 'A luxurious suite with a sea view.'
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Price of the room',
        example: 150.00
    })
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'Availability of the room',
        example: true
    })
    @IsBoolean()
    available: boolean;
}