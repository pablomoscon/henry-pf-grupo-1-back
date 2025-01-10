import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDate, IsOptional } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the cat',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Name of the cat', example: 'Lord Purrington' })
  @IsString()
  name: string;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Age of the cat', example: 9 })
  age: number;

  @Column({ type: 'date' })
  @ApiProperty({
    description: 'Birthdate of the cat',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsDate()
  birthdate: Date;

  @Column({ type: 'varchar' })
  @ApiProperty({ description: 'Race of the cat', example: 'Siamese' })
  @IsString()
  race: string;

  @ManyToOne(() => User, (user) => user.cats)
  @ApiProperty({ description: 'User who owns the cat' })
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the cat was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;

  @OneToMany(() => Media, (media) => media.cat)
  @ApiProperty({
    description: 'List of media associated with the cat',
    type: () => [Media],
  })
  media: Media[];
}
