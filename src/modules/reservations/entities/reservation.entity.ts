import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the reservation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({
    type: 'date',
  })
  @ApiProperty({
    description: 'Initial date of the reservation',
    example: '2025-01-09T00:00:00.000Z',
  })
  @IsDate()
  initial_date: Date;

  @Column({
    type: 'date',
  })
  @ApiProperty({
    description: 'Ending date of the reservation',
    example: '2025-01-09T00:00:00.000Z',
  })
  @IsDate()
  ending_date: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @ApiProperty({
    description: 'Timestamp when the room was deleted',
    example: '2025-01-09T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  deleted_at?: Date;

  @ManyToOne(() => User, (user) => user.reservations)
  @ApiProperty({ description: 'User who made the reservation' })
  user: User;

  @ManyToOne(() => Room, (room) => room.reservations)
  @ApiProperty({ description: 'Room being reserved' })
  room: Room;
}
