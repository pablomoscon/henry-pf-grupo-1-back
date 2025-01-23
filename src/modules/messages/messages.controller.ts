import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageResponseDto } from './dto/response-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const newMessage = await this.messagesService.create(createMessageDto, file);
    return new MessageResponseDto(newMessage);
  };

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.messagesService.findAll();
  };

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  };

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @UploadedFile() file: Express.Multer.File) {
    return this.messagesService.update(id, updateMessageDto);
  };

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  };
}
