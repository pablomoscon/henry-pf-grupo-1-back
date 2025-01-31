import { UpdateCredentialDto } from './dto/update-credential.dto';
import { Controller, Get, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { Credential } from './entities/credential.entity';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';

@Controller('credentials')
@ApiTags('credentials')
export class CredentialsController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly authService: AuthService
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Credential[]> {
    return await this.credentialsService.findAll();
  };

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('id') id: string,
    @Query('token') token: string, 
    @Body() updateCredentialDto: UpdateCredentialDto
  ): Promise<{ message: string }> {
    
    const userId = await this.authService.verifyToken(token);
    
    if (userId !== id) {
      throw new UnauthorizedException('Token no válido o ID no coincide.');
    }

    await this.credentialsService.updatePassword(id, updateCredentialDto);

    return { message: 'Password updated successfully' };
  };
}