import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ImageUploadValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  private readonly maxSizeInBytes = 2097152; //2mb
  transform(file: Express.Multer.File) {
   /*  if (!file) {
      throw new BadRequestException('No file recieved');
    } */
    
    if (file) {
      // Validaciones si hay un archivo
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type');
      }
      if (file.size > this.maxSizeInBytes) {
        throw new BadRequestException('File exceeds max size');
      }
    }
    
    return file;
  }
}
