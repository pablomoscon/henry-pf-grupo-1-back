import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { ReservationStatus } from "src/enums/reservation-status.enum";
import { User } from "src/modules/users/entities/user.entity";
import { Cat } from "src/modules/cats/entities/cat.entity";
import { Room } from "src/modules/rooms/entities/room.entity";
import { IsOptional } from "class-validator";
import { Payment } from "src/modules/payments/entities/payment.entity";

@Entity("reservations")
export class Reservation {
  @ApiProperty({
    description: "Unique identifier for the reservation",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  @ApiProperty({
    description: "Reservation start date",
    example: "2025-01-17",
  })
  checkInDate: Date;

  @Column({ type: "date" })
  @ApiProperty({
    description: "Reservation end date",
    example: "2025-01-20",
  })
  checkOutDate: Date;

  @Column({ type: "enum", enum: ReservationStatus, default: ReservationStatus.PENDING })
  @ApiProperty({
    description: "Reservation status",
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
    example: "PENDING",
  })
  status: ReservationStatus;

  @CreateDateColumn()
  @ApiProperty({
    description: "Date the reservation was created",
    example: "2025-01-10T12:00:00Z",
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: "Date the reservation was last updated",
    example: "2025-01-15T14:30:00Z",
  })
  @IsOptional()
  updatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'Timestamp when the user was deleted',
    example: '2025-01-10T00:00:00.000Z',
  })
  @IsOptional()
  deleted_at?: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  @ApiProperty({
    description: "Total amount for the reservation",
    example: 250.50,
  })
  totalAmount: number;

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
  @ManyToMany(() => Cat, (cat) => cat.reservations)
  @JoinTable()
  cats: Cat[];

  @ApiProperty({
    description: "Room reserved",
    type: () => Room,
    nullable: true,
  })
  @ManyToOne(() => Room, (room) => room.reservations)
  room: Room;

  @ApiProperty({
    description: 'List of payments associated with the reservation',
    type: () => [Payment],
  })
  @OneToMany(() => Payment, (payment) => payment.reservation)
  payments?: Payment[];
  
}