import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ImageUploadValidationPipe } from 'src/pipes/image-upload-validation.pipe';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Message } from './entities/message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }


  @Get()
  /* @ApiBearerAuth()
  @UseGuards(AuthGuard) */
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.messagesService.findAll();
  }

  @Get('user/:userId')
  async findMessagesByReservationUser(@Param('userId') userId: string, userClientId: string): Promise<Message[]> {
      const messages = await this.messagesService.findMessagesByReservationUser(userId, userClientId);
      if (messages.length === 0) {
        throw new NotFoundException(`No messages found for user with ID: ${userId}`);
      }
      return messages;
  };

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
  ) {
    return this.messagesService.update(id, updateChatDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
