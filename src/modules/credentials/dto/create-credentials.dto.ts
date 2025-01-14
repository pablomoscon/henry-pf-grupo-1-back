import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCredentialsDto {
    @IsString()
    @IsNotEmpty()
    password: string;
}