import { Injectable } from '@nestjs/common';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';

@Injectable()
export class CaretakersService {
  create(createCaretakerDto: CreateCaretakerDto) {
    return 'This action adds a new caretaker';
  }

  findAll() {
    return `This action returns all caretakers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caretaker`;
  }

  update(id: number, updateCaretakerDto: UpdateCaretakerDto) {
    return `This action updates a #${id} caretaker`;
  }

  remove(id: number) {
    return `This action removes a #${id} caretaker`;
  }
}
