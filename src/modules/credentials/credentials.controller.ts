import { UpdateCredentialDto } from './dto/update-credential.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { Credential } from './entities/credential.entity';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('credentials')
@ApiTags('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Credential[]> {
    return await this.credentialsService.findAll();
  };

  @Patch(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('id') id: string,
    @Body() updateCredentialDto: UpdateCredentialDto
  ): Promise<Credential> {
    return this.credentialsService.updatePassword(id, updateCredentialDto);
  };
}