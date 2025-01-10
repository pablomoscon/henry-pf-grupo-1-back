import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { Cat } from '../../cats/entities/cat.entity';
import { MediaType } from 'src/enums/media-type.enum';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the media',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ManyToOne(() => Cat, (cat) => cat.media)
  @ApiProperty({ description: 'Cat associated with the media' })
  cat: Cat;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'URL of the media',
    example: 'https://example.com/media.jpg',
  })
  @IsString()
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  @ApiProperty({ description: 'Type of the media', example: 'photo' })
  @IsEnum(MediaType)
  type: MediaType;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the media was uploaded',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  uploaded_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the media was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;
}
