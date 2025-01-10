import { Injectable } from '@nestjs/common';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';
import { UpdateChatHistoryDto } from './dto/update-chat-history.dto';

@Injectable()
export class ChatHistoryService {
  create(createChatHistoryDto: CreateChatHistoryDto) {
    return 'This action adds a new chatHistory';
  }

  findAll() {
    return `This action returns all chatHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatHistory`;
  }

  update(id: number, updateChatHistoryDto: UpdateChatHistoryDto) {
    return `This action updates a #${id} chatHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatHistory`;
  }
}
