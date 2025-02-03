import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()

export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) { }

  async create(
    createCatDto: CreateCatDto,
    file: Express.Multer.File,
  ): Promise<Cat> {
    
    let imgUrl: string | undefined;

    if (file) {
      const uploadedFile = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
      imgUrl = uploadedFile;
    }

    const user = await this.usersService.findOne(createCatDto.userId);
    if (!user) {
      throw new BadRequestException('There is no user with that ID.');
    }

    const newCat = this.catRepository.create({
      ...createCatDto,
      photo: imgUrl,
      user,
    });
    await this.catRepository.save(newCat);
    return newCat;
  };

  async findAll() {
    return await this.catRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['user'],
    });
  };

  async findOne(id: string) {
    return await this.catRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };

  async update(id: string, updateCatDto: UpdateCatDto, file?: Express.Multer.File): Promise<Cat> {
    let imgUrl: string | undefined;

    if (file) {
      imgUrl = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    const updatedCat = await this.catRepository.preload({
      id,
      ...updateCatDto,
      photo: imgUrl || undefined,
    });

    if (!updatedCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    await this.catRepository.save(updatedCat);

    return updatedCat;
  };

  async remove(id: string) {
    const cat = await this.catRepository.findOne({ where: { id } });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    cat.deleted_at = new Date();
    return this.catRepository.save(cat);
  };

  async isCatOwnedByUser(catId: string, userId: string): Promise<boolean> {
    const cat = await this.catRepository.findOne({ where: { id: catId, user: { id: userId } } });
    if (!cat) {
      throw new Error('The cat does not belong to the user.');
    }
    return true;
  };
}