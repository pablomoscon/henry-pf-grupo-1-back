import { Test, TestingModule } from '@nestjs/testing';
import { CaretakersService } from './caretakers.service';

describe('CaretakersService', () => {
  let service: CaretakersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaretakersService],
    }).compile();

    service = module.get<CaretakersService>(CaretakersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
