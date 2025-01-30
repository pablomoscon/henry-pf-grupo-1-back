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
import { MessageResponseDto } from './dto/response-post.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ImageUploadValidationPipe } from 'src/pipes/image-upload-validation.pipe';
import { Message } from './entities/message.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post('posts')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createPosts(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
  ) {
    const newMessage = await this.messagesService.createPosts(
      createPostDto,
      file,
    );
    return new MessageResponseDto(newMessage);
  };

  @Get()
  /* @ApiBearerAuth()
  @UseGuards(AuthGuard) */
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Message[]> {
    return this.messagesService.findAll();
  };

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
  findOne(@Param('id') id: string): Promise<Message> {
    return this.messagesService.findOne(id);
  };

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
  ): Promise<Message> {
    return this.messagesService.update(id, updatePostDto);
  };

  @Get('received/:userId')
  async findReceivedMessages(@Param('userId') userId: string): Promise<Message[]> {
    return this.messagesService.findReceivedMessagesByUser(userId);
  };

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  updateChat(
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ): Promise<Message> {
    return this.messagesService.update(id, updateChatDto);
  };

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  };
}
