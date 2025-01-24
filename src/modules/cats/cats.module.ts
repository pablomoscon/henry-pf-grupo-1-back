import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { FileUploadService } from '../file-upload/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, User]),
  ],
  controllers: [CatsController],
  providers: [CatsService, UsersService, FileUploadService, CloudinaryService],
})
export class CatsModule {}
