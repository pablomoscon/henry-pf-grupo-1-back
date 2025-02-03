import { forwardRef, Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { UsersModule } from '../users/users.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { CaretakersModule } from '../caretakers/caretakers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cat, User]),
    forwardRef(() => UsersModule), 
    forwardRef(() => CaretakersModule),
    FileUploadModule,
  ],
  controllers: [CatsController],
  providers: [CatsService, CloudinaryService],
  exports: [CatsService],
})
export class CatsModule {}
