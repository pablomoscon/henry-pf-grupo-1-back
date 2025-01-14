import { PartialType } from '@nestjs/swagger';
import { CreateCredentialDto } from './create-credential.dto';
import { User } from 'src/modules/users/entities/user.entity';

export class UpdateCredentialDto extends PartialType(CreateCredentialDto) {
    user?: User;
}