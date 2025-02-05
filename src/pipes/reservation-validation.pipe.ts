import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

import { ReservationsService } from 'src/modules/reservations/reservations.service';
import { CatsService } from 'src/modules/cats/cats.service';
import { CreateReservationDto } from 'src/modules/reservations/dto/create-reservation.dto';

@Injectable()
export class ReservationValidationPipe implements PipeTransform {
    constructor(
        private readonly reservationsService: ReservationsService,
        private readonly catsService: CatsService
        
    ) { }

    async transform(value: CreateReservationDto) {
        const { checkInDate, checkOutDate, roomId, catsIds, userId } = value;

        
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            throw new BadRequestException('Check-in date must be before check-out date.');
        }
        const isRoomAvailable = await this.reservationsService.isRoomAvailable(roomId, checkInDate, checkOutDate);
        if (!isRoomAvailable) {
            throw new BadRequestException('The room is not available for the selected dates');
        }

        const isUsersCat = await Promise.all(catsIds.map(cat => this.catsService.isCatOwnedByUser(cat, userId)));
        if (isUsersCat.some(isOwned => isOwned === false)) {
            throw new BadRequestException('One or more cats are not owned by the user');
        }

        const existingReservations = await this.reservationsService.findReservationsByRoomAndDate(roomId, checkInDate, checkOutDate);
        const isUserAlreadyBooked = existingReservations.some(reservation => reservation.user.id === userId);
        if (isUserAlreadyBooked) {
            throw new BadRequestException('You already have a reservation for this room on the selected dates.');
        }

        const roomBookingConflict = await this.reservationsService.findReservationsByRoomAndDate(roomId, checkInDate, checkOutDate);
        if (roomBookingConflict.length > 0) {
            throw new BadRequestException('The room is already booked for some or all of the selected dates.');
        }

        return value;  
    };
}