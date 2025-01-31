import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsInt,
  IsArray,
} from 'class-validator';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { RoomFeatures } from '../../../enums/rooms-features.enum';
import { Location } from '../../../modules/locations/entities/location.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the room',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  @ApiProperty({
    description: 'Name of the room',
    example: 'Luxury Suite',
  })
  @IsString()
  name: string;

  @Column({
    type: 'text',
    default:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWz9tftw9qculFH1gxieWkxL6rbRk_hrXTSg&s',
  })
  @ApiProperty({
    description: 'Image URL for the room',
    example: 'https://example.com/room-image.jpg',
  })
  @IsString()
  img: string;

  @Column({
    type: 'text',
  })
  @ApiProperty({
    description: 'Description of the room',
    example:
      'A comfortable suite designed for cats with cozy spaces and a peaceful environment.',
  })
  @IsString()
  description: string;

  @Column({
    type: 'decimal',
  })
  @ApiProperty({
    description: 'Price of the room',
    example: 150.0,
  })
  @IsDecimal()
  price: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  @ApiProperty({
    description: 'Availability of the room',
    example: true,
  })
  @IsBoolean()
  available: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @ApiProperty({
    description: 'Timestamp when the room was deleted',
    example: '2025-01-09T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  deleted_at?: Date;

  @Column({
    type: 'int',
  })
  @ApiProperty({
    description: 'Number of cats',
    example: 3,
  })
  @IsInt()
  number_of_cats: number;

  @Column({
    enum: RoomFeatures,
    type: 'simple-array' 
  })
  @ApiProperty({
    description: 'Features of the room',
    example: [RoomFeatures.HidingPlace, RoomFeatures.Hammocks],
  })
  @IsEnum(RoomFeatures, { each: true })
  @IsArray()
  features: RoomFeatures[];

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  @ApiProperty({
    description: 'List of reservations associated with the room',
    type: () => [Reservation],
  })
  reservations: Reservation[];

  @OneToMany(() => Location, (location) => location.rooms)
  @ApiProperty({
    description: 'Location associated with the room',
    type: () => Location,
  })
  location: Location;
}
