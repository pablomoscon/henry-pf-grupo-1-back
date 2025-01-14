import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { Credentials } from './entities/credentials.entity';


@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) { }

  @Get()
  findAll(): Promise<Credentials[]> {
    return this.credentialsService.findAll();
  }
}
