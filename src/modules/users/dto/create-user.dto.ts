import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsNotEmpty, IsEmail } from 'class-validator';
import { Role } from 'src/enums/roles.enum';

export class CreateUserDto {
    
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
        description: 'Phone number of the user',
        example: '+5412345678 ',
    })
    @IsString()
    @IsNotEmpty({ message: 'The phone number cannot be empty.' })
    phone: string;

    @ApiProperty({ description: 'Birthdate of the user', example: '1990-01-01' })
    @IsDate()
    @IsNotEmpty({ message: 'The birthdate cannot be empty.' })
    birthdate: Date;

    @ApiProperty({
        description: 'Role of the user',
        example: 'ADMIN',
        required: false,
    })
    @IsOptional()
    role?: Role;

}
