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
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageResponseDto } from './dto/response-message.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ImageUploadValidationPipe } from 'src/pipes/image-upload-validation.pipe';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
 /*  @ApiBearerAuth()
  @UseGuards(AuthGuard) */
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
  ) {
    const newMessage = await this.messagesService.create(
      createMessageDto,
      file,
    );
    /* return new MessageResponseDto(newMessage); */
    return newMessage
  }

  @Get()
/*   @ApiBearerAuth()
  @UseGuards(AuthGuard) */
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
 /*  @ApiBearerAuth()
  @UseGuards(AuthGuard) */
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
  ) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
