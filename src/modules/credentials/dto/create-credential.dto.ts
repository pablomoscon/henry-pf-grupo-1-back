import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCredentialDto {
    @IsString()
    @IsNotEmpty()
    password: string;
}