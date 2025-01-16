import { IsString, IsNumber, IsNotEmpty, IsInstance } from 'class-validator';
import { Buffer } from 'buffer';

export class UploadFileDto {
  @IsString()
  fieldName: string;

  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsInstance(Buffer)
  @IsNotEmpty()
  buffer: Buffer;
}
