import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsBoolean,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';
import { Media } from 'src/modules/media/entities/media.entity';
import { CatCompatibility } from 'src/enums/cat-compatibility.enum';
import { CatVaccinations } from 'src/enums/cat-vaccinations.enum';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the cat',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'Full name of the cat', example: 'Whiskers Purrington' })
  @IsString()
  name: string;

  @Column({ type: 'date' })
  @ApiProperty({
    description: 'Date of birth of the cat',
    example: '2022-06-15',
  })
  @IsDate()
  dateOfBirth: Date;

  @Column({ type: 'boolean' })
  @ApiProperty({ description: 'Is the cat neutered?', example: true })
  @IsBoolean()
  isNeutered: boolean;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({
    description: 'Personality of the cat',
    example: 'Playful and friendly',
  })
  @IsString()
  personality: string;

  @Column({ type: 'varchar', length: 20 })
  @ApiProperty({
    description: 'Does the cat get along with other cats?',
    example: 'yes',
    enum: CatCompatibility,
  })
  @IsEnum(CatCompatibility)
  getsAlongWithOtherCats: CatCompatibility;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({
    description: 'What food does the cat eat?',
    example: 'Dry food and wet food',
  })
  @IsString()
  food: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({
    description: 'Is the cat taking any medication?',
    example: 'Antibiotics for an infection',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  medication?: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'How does the cat behave when visiting the veterinarian?',
    example: 'Nervous but manageable',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  behaviorAtVet?: string;

  @Column({ type: 'simple-array' })
  @ApiProperty({
    description: 'Vaccinations, tests, or certificates the cat has',
    example: ['rabies', 'triple feline', 'FIV/Felv test'],
    enum: CatVaccinations,
  })
  @IsArray()
  @IsEnum(CatVaccinations, { each: true })
  vaccinationsAndTests: CatVaccinations[];

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({
    description: 'Photo of the cat',
    example: 'https://example.com/images/whiskers.jpg',
  })
  @IsString()
  photo: string;

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

  @ManyToMany(() => Reservation, (reservation) => reservation.cats)
  @ApiProperty({
    description: 'List of reservations associated with the cat',
    type: () => [Reservation],
  })
  reservations: Reservation[];
}