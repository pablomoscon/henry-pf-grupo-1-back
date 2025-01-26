import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsBoolean, IsInt } from 'class-validator';
import { Room } from '../../../modules/rooms/entities/room.entity';
import { Caretaker } from '../../../modules/caretakers/entities/caretaker.entity';
@Entity('locations')
export class Location {

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the location',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: 'Name of the location',
    example: 'Capital City Location',
  })
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({
    description: 'Address of the location',
    example: 'Libertador 2000',
  })
  @IsString()
  address: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: 'City of the location',
    example: 'Capital Federal',
  })
  @IsString()
  city: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: 'Country of the location',
    example: 'Argentina',
  })
  @IsString()
  country: string;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({
    description: 'Coordinates of the location for map integration',
    example: { lat: 24.3153102, lng: -75.7379289 },
  })
  coordinates?: { lat: number; lng: number };

  @Column({ type: 'int' })
  @ApiProperty({
    description: 'Number of rooms of the location',
    example: 10,
  })
  @IsInt()
  capacity: number;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({
    description: 'Is the location open?',
    example: true,
  })
  @IsBoolean()
  open: boolean;

  @OneToMany(() => Room, (room) => room.location)
  @ApiProperty({
    description: 'Rooms associated with the location',
    type: () => [Room],
  })
  rooms: Room[];

  @OneToMany(() => Caretaker, (caretaker) => caretaker.location)
  @ApiProperty({
    description: 'Caretakers associated with the location',
    type: () => [Caretaker],
  })
  caretakers: Caretaker[];
}
