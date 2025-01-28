import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';
import { MessageType } from 'src/enums/message-type';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the message',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'URL of the media (optional)',
    example: 'https://example.com/media.jpg',
  })
  @IsString()
  @IsOptional()
  media_url?: string;

  @Column({ type: 'enum', enum: MessageType })
  @ApiProperty({ description: 'Type of the message', example: 'CHAT' })
  @IsEnum(MessageType)
  type: MessageType;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the media was uploaded (optional)',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  uploaded_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the media was deleted (optional)',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Content of the message',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  @IsString()
  @IsOptional()
  body?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  @ApiProperty({
    description: 'Timestamp of the message',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsDate()
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @ApiProperty({ description: 'Sender of the message' })
  sender: User;

  @ManyToMany(() => User, (user) => user.receivedMessages)
  @JoinTable()
  @ApiProperty({ description: 'Receivers of the message' })
  receivers: User[];

  @ManyToOne(() => Reservation, (reservation) => reservation.messages) 
  @ApiProperty({ description: 'Reservation associated with the message' })
  reservation: Reservation;
}
