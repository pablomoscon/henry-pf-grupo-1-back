import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from 'src/modules/locations/entities/location.entity';
import { Repository } from 'typeorm';
import { locationsMock } from './locations-mock';

@Injectable()
export class LocationsSeed {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async seed() {
    const existingLocations = (await this.locationRepository.find()).map(
      (location) => location.id,
    );
    for (const locationData of locationsMock) {
      if (!existingLocations.includes(locationData.id)) {
        const location = new Location();
        location.id = locationData.id;
        location.name = locationData.name;
        location.address = locationData.address;
        location.city = locationData.city;
        location.country = locationData.country;
        location.coordinates = locationData.coordinates;
        location.capacity = locationData.capacity;
        location.open = locationData.open;
        location.rooms = locationData.rooms;
        location.caretakers = locationData.caretakers;
        await this.locationRepository.save(location);
      }
    }
  }
}
