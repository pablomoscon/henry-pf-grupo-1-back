import { Test, TestingModule } from '@nestjs/testing';
import { CaretakersController } from './caretakers.controller';
import { CaretakersService } from './caretakers.service';

describe('CaretakersController', () => {
  let controller: CaretakersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaretakersController],
      providers: [CaretakersService],
    }).compile();

    controller = module.get<CaretakersController>(CaretakersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
