import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    Min,
    Max,
    IsOptional,
} from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: 'Unique identifier for the review',
        example: '321e4567-f73k-25t2-a456-426614177755',
    })
    id: string;

    @Column({ type: 'varchar', length: 100 })
    @ApiProperty({
        description: 'Name of the user submitting the review',
        example: 'John Doe',
    })

    @Column({ type: 'text' })
    @ApiProperty({
        description: 'Text of the review',
        example: 'This product is excellent. I highly recommend it.',
    })
    @IsNotEmpty({ message: 'The review text cannot be empty.' })
    @IsString({ message: 'The review text must be a string.' })
    textBody: string;

    @Column({ type: 'int' })
    @ApiProperty({
        description: 'Rating given by the user (between 1 and 5)',
        example: 4,
    })
    @IsNotEmpty({ message: 'The rating cannot be empty.' })
    @IsNumber({}, { message: 'The rating must be a number.' })
    @Min(1, { message: 'The minimum rating is 1.' })
    @Max(5, { message: 'The maximum rating is 5.' })
    rating: number;

    @ApiProperty({
        description: 'User who submitted the review',
    })
    @ManyToOne(() => User, (user) => user.reviews)
    user: User;

    @Column({ type: 'timestamp', nullable: true })
    @ApiProperty({
        description: 'Timestamp when the review was deleted',
        example: '2025-01-10T00:00:00.000Z',
    })
    @IsOptional()
    deleted_at?: Date;
}