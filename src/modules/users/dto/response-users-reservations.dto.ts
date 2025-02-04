import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";


export class ResponseUsersReservationsDto {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'User name',
        example: 'Alice Smith',
    })
    @IsString()
    userName: string;

    @ApiProperty({
        description: 'List of cats names',
        example: ['Shadow Paws'],
    })
    @IsArray()
    catsNames: string[];

    @ApiProperty({
        description: 'Room name',
        example: 'Room A',
    })
    @IsString()
    roomName: string;

    @ApiProperty({
        description: 'Check-in date',
        example: '2025-01-27',
    })
    @IsString()
    checkInDate: string;

    @ApiProperty({
        description: 'Check-out date',
        example: '2025-01-29',
    })
    @IsString()
    checkOutDate: string;

    @ApiProperty({
        description: 'The id of the reservation',
        example: 'Room A',
    })
    @IsString()
    reservationId: string;

    constructor(
        userId: string,
        userName: string,
        catsNames: string[],
        roomName: string,
        checkInDate: string,
        checkOutDate: string,
        reservationId: string
    ) {
        this.userId = userId;
        this.userName = userName;
        this.catsNames = catsNames;
        this.roomName = roomName;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.reservationId = reservationId;
    }

    static fromReservationData(reservation: any): ResponseUsersReservationsDto {
        const userId = reservation.user.id;
        const userName = reservation.user.name;
        const catsNames = reservation.cats.map((cat: any) => cat.name);
        const roomName = reservation.room.name || ''; 
        const checkInDate = reservation.checkInDate;
        const checkOutDate = reservation.checkOutDate;
        const reservationId = reservation.id;

        return new ResponseUsersReservationsDto(userId, userName, catsNames, roomName, checkInDate, checkOutDate, reservationId);
    }
}
