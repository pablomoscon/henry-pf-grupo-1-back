import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsDecimal,
  IsInt,
  IsOptional,
} from 'class-validator';
import { RoomFeatures } from '../../../enums/rooms-features.enum';
import { Transform } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Name of the room',
    example: 'Deluxe Suite',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Image URL for the room',
    example: 'https://example.com/room-image.jpg',
  })
  @IsArray()
  @IsString()
  img: string;

  @ApiProperty({
    description: 'Description of the room',
    example:
      'A comfortable suite designed for cats with cozy spaces and a peaceful environment.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Price of the room',
    example: 150.0,
  })
  @IsDecimal()
  price: number;

  @ApiProperty({
    description: 'Number of cats',
    example: 3,
  })
  @IsInt()
  number_of_cats: number;

  @ApiProperty({
    description: 'Features of the room',
    example: [RoomFeatures.hidingPlace, RoomFeatures.hammocks],
  })
  @IsArray()
  @IsEnum(RoomFeatures, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  features: RoomFeatures[];

  @IsOptional()
  locationId?: string;
}
