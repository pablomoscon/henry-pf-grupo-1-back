import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDate, IsOptional } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity('chat_history')
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the chat history',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ManyToOne(() => User, (user) => user.sentChats)
  @ApiProperty({ description: 'Sender of the message' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedChats)
  @ApiProperty({ description: 'Receiver of the message' })
  receiver: User;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'Content of the message',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  @IsString()
  message: string;

  @Column({ type: 'timestamp' })
  @ApiProperty({
    description: 'Timestamp when the message was sent',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsDate()
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the chat history was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;
}
