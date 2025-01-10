import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDate } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity('caretakers')
export class Caretaker {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the caretaker',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ManyToOne(() => User, (user) => user.caretakers)
  @ApiProperty({ description: 'User who is the caretaker' })
  user: User;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'Profile information of the caretaker',
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  })
  @IsString()
  profile: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the caretaker was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;
}
