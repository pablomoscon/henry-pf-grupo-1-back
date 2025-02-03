import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the credentials',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Password for the credential',
    example: 'Pass1234!',
  })
  @IsString()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    description: 'Unique identifier assigned by Google OAuth2 for the user',
    example: '123456789012345678901',
  })
  @IsOptional()
  googleId?: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the credential was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;

  @OneToOne(() => User, (user) => user.credential)
  @JoinColumn()
  @ApiProperty({
    description: 'User associated with the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user: User;
}
