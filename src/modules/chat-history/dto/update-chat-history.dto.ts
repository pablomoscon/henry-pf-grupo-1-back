import { PartialType } from '@nestjs/swagger';
import { CreateChatHistoryDto } from './create-chat-history.dto';

export class UpdateChatHistoryDto extends PartialType(CreateChatHistoryDto) {}
