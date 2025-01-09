import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsBoolean,
    IsDate,
    IsUUID,
    IsDecimal,
    IsOptional,
    IsArray,
} from 'class-validator';

@Entity('rooms')
export class Room {
    
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: 'Unique identifier for the room',
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsUUID()
    id: string;

    @Column({ type: 'varchar', length: 100 })
    @ApiProperty({
        description: 'Name of the room',
        example: 'Luxury Suite'
    })
    @IsString()
    name: string;

    @Column({
        type: 'text',
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWz9tftw9qculFH1gxieWkxL6rbRk_hrXTSg&s'
    })
    @ApiProperty({
        description: 'Images URLs for the room',
        example: ['https://example.com/product-image.jpg', 'https://example.com/product-image2.jpg'],
    })
    @IsArray()
    @IsString()
    imgs: string;

    @Column({ type: 'text' })
    @ApiProperty({
        description: 'Description of the room',
        example: 'A luxurious suite with a sea view.'
    })
    @IsString()
    description: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2
    })
    @ApiProperty({
        description: 'Price of the room',
        example: 150.00
    })
    @IsDecimal()
    price: number;

    @Column({
        type: 'boolean',
        default: true
    })
    @ApiProperty({
        description: 'Availability of the room',
        example: true
    })
    @IsBoolean()
    available: boolean;

    @Column({ type: 'timestamp', nullable: true })
    @ApiProperty({
        description: 'Timestamp when the room was deleted, if applicable',
        example: '2025-01-09T00:00:00.000Z'
    })
    @IsDate()
    @IsOptional() 
    deleted_at?: Date;

     @OneToMany(() => Registration, (registration) => registration.room)
    @ApiProperty({
        description: 'List of registrations associated with the room',
        type: () => [Registration]
    })
     registrations: Registration[];
    
}
