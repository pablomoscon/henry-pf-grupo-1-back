import { IsString, IsNumber, IsNotEmpty, IsInstance, IsIn } from 'class-validator';
import { Buffer } from 'buffer';

export class UploadFileDto {
  @IsString()
  fieldName: string;

  @IsString()
  originalName: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'video/mp4', 'video/webm'], { message: 'Invalid file type.' })
  mimeType: string;

  @IsNumber()
  size: number;

  @IsInstance(Buffer)
  @IsNotEmpty()
  buffer: Buffer;
}