import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
