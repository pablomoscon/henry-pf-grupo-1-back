import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-chat.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) { }
