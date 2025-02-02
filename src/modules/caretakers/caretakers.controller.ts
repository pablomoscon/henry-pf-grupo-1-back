import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CaretakersService } from './caretakers.service';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { Caretaker } from './entities/caretaker.entity';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';

@ApiTags('caretakers')
@Controller('caretakers')
export class CaretakersController {
  constructor(private readonly caretakersService: CaretakersService) { }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCaretakerDto: CreateCaretakerDto): Promise<Caretaker> {
    return await this.caretakersService.create(createCaretakerDto);
  };

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Caretaker[]> {
    return await this.caretakersService.findAll();
  };

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Caretaker> {
    return await this.caretakersService.findOne(id);
  };

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateCaretakerDto: UpdateCaretakerDto) {
    return this.caretakersService.update(id, updateCaretakerDto);
  };

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caretakersService.remove(id);
  };
}
