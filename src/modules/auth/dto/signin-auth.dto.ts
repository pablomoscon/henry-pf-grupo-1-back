import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SignInAuthDto {
   
   
    @ApiProperty({
        description: 'The email address of the user',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'The email must be in a valid format (e.g., user@example.com).' })
    @IsNotEmpty({ message: 'The email field cannot be empty.' })
    email: string;

    @ApiProperty({ description: 'Password for login', example: 'Pass1234!' })
    @IsNotEmpty({ message: 'The password field cannot be empty.' })
    @IsString()
    password: string;
}
