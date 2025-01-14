import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { Credential } from './entities/credential.entity';


@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) { }

  @Get()
  findAll(): Promise<Credential[]> {
    return this.credentialsService.findAll();
  }
}