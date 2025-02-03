import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { ResponseUsersReservationsDto } from './dto/response-users-reservations.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CARETAKER)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    return await this.usersService.findAll(pageNumber, limitNumber);
  };

  @Get('caretakers')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findCaretakers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.usersService.findCaretakers(page, limit);
  };

  @Get('user-role')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findUserRole(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12
  ) {
    return this.usersService.findUserRole(page, limit);
  };

  @Get('clients-reservations')
  @HttpCode(HttpStatus.OK)
  async findUsersWithReservations() {
    return await this.usersService.findUsersWithReservations()
  };

  @Get('cats/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async usersCats(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.usersCats(id);
  };

  @Get(':id/caretaker-reservations')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findUsersAndReservationsFromCaretaker(@Param('id') id: string) {
    const userAndReservations = await this.usersService.findUsersAndReservationsFromCaretaker(id);
    if (userAndReservations && userAndReservations.length > 0) {
      return userAndReservations.map(reservation => ResponseUsersReservationsDto.fromReservationData(reservation));
    } else {
      throw new Error("No reservations found for this user");
    }
  };

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  };

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  };

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.remove(id);
  };
}
