import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { RoomFeatures } from 'src/enums/rooms-features.enum';
import { Transform } from 'class-transformer';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    @IsOptional()
    @IsArray()
    @IsEnum(RoomFeatures, { each: true })
    @Transform(({ value }) => {
        // Si `value` es un string que representa un array, lo parseamos
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                throw new Error('El formato de "features" es inválido');
            }
        }
        return value;
    })
    features: RoomFeatures[];
}
