import { PartialType } from '@nestjs/swagger';
import { CreateCredentialsDto } from './create-credentials.dto';
import { User } from 'src/modules/users/entities/user.entity';

export class UpdateCredentialsDto extends PartialType(CreateCredentialsDto) { 
    user?: User;
}
