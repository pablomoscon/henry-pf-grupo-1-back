import { PartialType } from '@nestjs/swagger';
import { CreateCredentialDto } from './create-credential.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { IsString, MinLength } from 'class-validator';

export class UpdateCredentialDto extends PartialType(CreateCredentialDto) {
    user?: User;

    @IsString()
    @MinLength(6)  
    currentPassword?: string;

    @IsString()
    @MinLength(6)
    newPassword?: string;

    @IsString()
    @MinLength(6)
    confirmNewPassword?: string;

}