import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDate } from 'class-validator';
import { Credential } from '../../credentials/entities/credential.entity';
import { Cat } from '../../cats/entities/cat.entity';
import { Caretaker } from '../../caretakers/entities/caretaker.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { ChatHistory } from '../../chat-history/entities/chat-history.entity';
import { Role } from 'src/enums/roles.enum';
import { Status } from 'src/enums/status.enum';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Message } from 'src/modules/messages/entities/message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({ type: 'varchar', length: 25 })
  @ApiProperty({ description: 'Name of the user', example: 'John Williams' })
  @IsString()
  name: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Email of the user',
    example: 'john.williams@mail.com',
  })
  @IsString()
  email: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Customer ID associated with the user in external systems',
    example: '29309649',
  })
  @IsString()
  @IsOptional()
  customerId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+5412345678 ',
  })
  @IsString()
  @IsOptional()
  phone: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the user was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main St, Springfield',
  })
  @IsString()
  @IsOptional()
  address: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @ApiProperty({
    description: 'Role of the user',
    example: 'USER',
  })
  role: Role;

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
  @ApiProperty({
    description: 'Status of the user',
    example: 'ACTIVE',
  })
  status: Status;

  @OneToOne(() => Credential)
  @ApiProperty({
    description: 'Credential associated with the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @JoinColumn()
  credential: Credential;

  @ApiProperty({
    description: 'List of cats owned by the user',
    type: () => [Cat],
  })
  @OneToMany(() => Cat, (cat) => cat.user)
  cats: Cat[];

  @ApiProperty({
    description: 'List of caretakers managed by the user',
    type: () => [Caretaker],
  })
  @OneToOne(() => Caretaker, { nullable: true })
  @JoinColumn()
  caretakerProfile: Caretaker;

  @ApiProperty({
    description: 'List of reservations made by the user',
    type: () => [Reservation],
  })
  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @ApiProperty({
    description: 'List of chat messages sent by the user',
    type: () => [ChatHistory],
  })
  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.sender)
  sentChats: ChatHistory[];

  @ApiProperty({
    description: 'List of chat messages received by the user',
    type: () => [ChatHistory],
  })
  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.receiver)
  receivedChats: ChatHistory[];

  @ApiProperty({
    description: 'List of messages sent by the user',
    type: () => [Message],
  })
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: ChatHistory[];

  @ManyToMany(() => Message, (message) => message.receivers)
  @ApiProperty({
    description: 'List of messages received by the user',
    type: () => [Message],
  })
  receivedMessages: Message[];

  @ApiProperty({
    description: 'List of payments made by the user',
    type: () => [Payment],
  })
  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];
}
