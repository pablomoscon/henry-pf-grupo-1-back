import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseUUIDPipe, HttpException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cats')
@ApiTags('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('photoFile'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCatDto: CreateCatDto) {
    return await this.catsService.create(createCatDto, file);
  };

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.catsService.findAll();
  };

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const cat = await this.catsService.findOne(id);
    if (!cat) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return cat;
  };

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('photoFile'))  
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCatDto: UpdateCatDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.catsService.update(id, updateCatDto, file);
  };

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.catsService.remove(id);
  };
}
