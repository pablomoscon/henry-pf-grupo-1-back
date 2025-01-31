import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) { }

  create(createLocationDto: CreateLocationDto) {
    return 'This action adds a new location';
  };

  findAll() {
    return `This action returns all locations`;
  }

  async findOne(id: string): Promise<Location | null> {
    return await this.locationsRepository.findOne({ where: { id } });
  };

  update(id: string, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  };

  remove(id: string) {
    return `This action removes a #${id} location`;
  };
}
