import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location) private readonly locationRepository: Repository<Location>,
  ) { }

  create(createLocationDto: CreateLocationDto) {
    return 'This action adds a new location';
  };

  async findAll(): Promise<Location[]> {
    return await this.locationRepository.find();
  };

  async findOne(id: string): Promise<Location> {
    return await this.locationRepository.findOne({
      where: { id }
    })
  };
  
  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.locationRepository.preload({
      id,
      ...updateLocationDto,
    });
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    return await this.locationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.locationRepository.findOne({ where: { id } })
    if (!location) {
      throw new Error(`Location with id ${id} not found`);
    }
    await this.locationRepository.remove(location);
  }
}