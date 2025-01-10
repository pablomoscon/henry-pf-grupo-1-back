import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaretakersService } from './caretakers.service';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';

@Controller('caretakers')
export class CaretakersController {
  constructor(private readonly caretakersService: CaretakersService) {}

  @Post()
  create(@Body() createCaretakerDto: CreateCaretakerDto) {
    return this.caretakersService.create(createCaretakerDto);
  }

  @Get()
  findAll() {
    return this.caretakersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caretakersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaretakerDto: UpdateCaretakerDto) {
    return this.caretakersService.update(+id, updateCaretakerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caretakersService.remove(+id);
  }
}
