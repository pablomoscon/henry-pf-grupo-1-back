import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsBoolean, IsArray, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { CatCompatibility } from 'src/enums/cat-compatibility.enum';
import { CatVaccinations } from 'src/enums/cat-vaccinations.enum';

export class CreateCatDto {
    @ApiProperty({ description: 'Full name of the cat', example: 'Whiskers Purrington' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Date of birth of the cat', example: '2022-06-15' })
    @IsDate()
    dateOfBirth: Date;

    @ApiProperty({ description: 'Is the cat neutered?', example: true })
    @IsBoolean()
    isNeutered: boolean;

    @ApiProperty({ description: 'Personality of the cat', example: 'Playful and friendly' })
    @IsString()
    personality: string;

    @ApiProperty({ description: 'Does the cat get along with other cats?', enum: CatCompatibility, example: 'yes' })
    @IsEnum(CatCompatibility)
    getsAlongWithOtherCats: CatCompatibility;

    @ApiProperty({ description: 'What food does the cat eat?', example: 'Dry food and wet food' })
    @IsString()
    food: string;

    @ApiProperty({
        description: 'Is the cat taking any medication?',
        example: 'Antibiotics for an infection',
        nullable: true,
    })
    @IsString()
    medication: string;

    @ApiProperty({
        description: 'How does the cat behave when visiting the veterinarian?',
        example: 'Nervous but manageable',
        nullable: true,
    })
    @IsString()
    behaviorAtVet: string;

    @ApiProperty({
        description: 'Vaccinations, tests, or certificates the cat has',
        example: ['rabies', 'triple feline', 'FIV/Felv test'],
        enum: CatVaccinations,
    })
    @IsArray()
    @IsEnum(CatVaccinations, { each: true })
    vaccinationsAndTests: CatVaccinations[];

    @ApiProperty({
        description: 'Photo of the cat',
        example: 'https://example.com/images/whiskers.jpg',
    })
    @IsString()
    photo: string;

    @ApiProperty({ description: 'User who owns the cat' })
    @IsUUID()
    @IsNotEmpty()
    userId: string;
}