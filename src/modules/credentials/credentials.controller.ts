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
  findAll(): Promise<Credential[]> {
    return this.credentialsService.findAll();
  };

  @UseGuards(AuthGuard)
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @CurrentUser() user: User,
    @Body() updateCredentialDto: UpdateCredentialDto,
  ): Promise<Credential> {
    return await this.credentialsService.updatePassword(user, updateCredentialDto.password);
  };
}