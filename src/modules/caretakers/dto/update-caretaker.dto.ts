import { PartialType } from '@nestjs/swagger';
import { CreateCaretakerDto } from './create-caretaker.dto';

export class UpdateCaretakerDto extends PartialType(CreateCaretakerDto) {}
