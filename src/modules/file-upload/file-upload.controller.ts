import { Controller, UseGuards } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('file-upload')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}
}
