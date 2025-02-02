import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEmail, Matches, IsUUID, IsArray } from 'class-validator';
import { Role } from 'src/enums/roles.enum';

export class CaretakerSignupAuthDto {

    @ApiProperty({ description: 'Name of the user', example: 'John Williams' })
    @IsString({ message: 'The name must be a string.' })
    @IsNotEmpty({ message: 'The name cannot be empty.' })
    name: string;

    @ApiProperty({
        description: 'Email of the user',
        example: 'john.williams@mail.com',
    })
    @IsEmail({}, { message: 'The email must be a valid email address.' })
    @IsNotEmpty({ message: 'The email cannot be empty.' })
    email: string;

    @ApiProperty({
        description: 'The password for the user account',
        example: 'Password123!',
    })
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
        message: 'Password must be between 8 and 15 characters, include at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*)'
    })
    password: string;

    @ApiProperty({
        description: 'Confirmation of the password',
        example: 'Password123!',
    })
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
        message: 'Passwords do not match'
    })
    confirmPassword: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+5412345678 ',
    })
    @IsString()
    @IsNotEmpty({ message: 'The phone number cannot be empty.' })
    phone: string;

    @ApiProperty({
        description: 'Customer ID associated with the user in external systems',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @ApiProperty({
        description: 'Address of the user',
        example: '123 Main St, Springfield',
    })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({
        description: 'Role of the user',
        example: 'ADMIN',
        required: false,
    })
    @IsOptional()
    role?: Role;

    @ApiProperty({
        description: 'Profile information of the caretaker',
        example: 'Lorem ipsum dolor sit amet...',
    })
    @IsString()
    profileData: string;

}