import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { ReservationStatus } from "src/enums/reservation-status.enum";
import { User } from "src/modules/users/entities/user.entity";
import { Cat } from "src/modules/cats/entities/cat.entity";
import { Room } from "src/modules/rooms/entities/room.entity";
import { IsOptional } from "class-validator";

@Entity("reservations")
export class Reservation {
  @ApiProperty({
    description: "Unique identifier for the reservation",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "User making the reservation",
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.reservations, { onDelete: "CASCADE" })
  user: User;

  @ApiProperty({
    description: "Cat associated with the reservation",
    type: () => Cat,
  })
  @ManyToOne(() => Cat, (cat) => cat.reservations, { onDelete: "CASCADE" })
  cat: Cat;

  @ApiProperty({
    description: "Room reserved",
    type: () => Room,
    nullable: true,
  })
  @ManyToOne(() => Room, (room) => room.reservations, { onDelete: "SET NULL" })
  room: Room;

  @ApiProperty({
    description: "Reservation start date",
    example: "2025-01-17",
  })
  @Column({ type: "date" })
  checkInDate: Date;

  @ApiProperty({
    description: "Reservation end date",
    example: "2025-01-20",
  })
  @Column({ type: "date" })
  checkOutDate: Date;

  @ApiProperty({
    description: "Reservation status",
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
    example: "PENDING",
  })
  @Column({ type: "enum", enum: ReservationStatus, default: ReservationStatus.PENDING })
  status: ReservationStatus;

  @ApiProperty({
    description: "Date the reservation was created",
    example: "2025-01-10T12:00:00Z",
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "Date the reservation was last updated",
    example: "2025-01-15T14:30:00Z",
  })
  @IsOptional()
  @UpdateDateColumn()
  updatedAt?: Date;
}