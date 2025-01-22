import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseUUIDPipe, HttpException } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('cats')
@ApiTags('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCatDto: CreateCatDto) {
    return await this.catsService.create(createCatDto);
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
  async update(@Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCatDto: UpdateCatDto
  ) {
    return await this.catsService.update(id, updateCatDto);
  };

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.catsService.remove(id);
  };
}
