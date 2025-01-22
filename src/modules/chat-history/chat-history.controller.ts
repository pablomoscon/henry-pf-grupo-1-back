import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';
import { UpdateChatHistoryDto } from './dto/update-chat-history.dto';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Post()
  create(@Body() createChatHistoryDto: CreateChatHistoryDto) {
    return this.chatHistoryService.create(createChatHistoryDto);
  }

  @Get()
  findAll() {
    return this.chatHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatHistoryDto: UpdateChatHistoryDto) {
    return this.chatHistoryService.update(+id, updateChatHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatHistoryService.remove(+id);
  }
}
