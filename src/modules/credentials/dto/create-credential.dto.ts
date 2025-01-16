import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCredentialDto {
    @ApiProperty({
        description: 'Unique identifier for the credentials',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'Unique identifier assigned by Google OAuth2 for the user',
        example: '123456789012345678901',
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    googleId?: string;
}