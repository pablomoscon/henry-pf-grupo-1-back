import { Injectable } from '@nestjs/common';
import { cloudinaryConfig } from 'src/config/cloudinary.config';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config(cloudinaryConfig);
  }

  async uploadFile(buffer: Buffer, originalName?: string): Promise<string> {
    const options: UploadApiOptions = {
      folder: 'uploads',
      public_id: originalName,
      resource_type: 'auto',
    };

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          error ? reject(error) : resolve(result.secure_url);
        },
      );
      stream.write(buffer);
      stream.end();
    });
  }
}
