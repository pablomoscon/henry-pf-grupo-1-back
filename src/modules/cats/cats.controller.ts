import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  HttpException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ImageUploadValidationPipe } from 'src/pipes/image-upload-validation.pipe';

@Controller('cats')
@ApiTags('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('photoFile'))
  async create(
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
    @Body() createCatDto: CreateCatDto,
  ) {
    return await this.catsService.create(createCatDto, file);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.catsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const cat = await this.catsService.findOne(id);
    if (!cat) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return cat;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('photoFile'))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCatDto: UpdateCatDto,
    @UploadedFile(new ImageUploadValidationPipe()) file?: Express.Multer.File,
  ) {
    return await this.catsService.update(id, updateCatDto, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.catsService.remove(id);
  }
}
