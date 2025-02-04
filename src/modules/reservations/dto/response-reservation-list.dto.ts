export class ReservationListDTO {
    id: string;
    checkIn: string | null;
    checkOut: string | null;
    totalAmount: number;
    status: string;
    roomName: string | null;
    cats: string[];
    caretakers: { id: string; name: string }[];
    payments: string[];
    userName: string;

    constructor(reservation: any) {
        this.id = reservation.id;
        this.checkIn = reservation.checkInDate ? new Date(reservation.checkInDate).toISOString().split("T")[0] : null;
        this.checkOut = reservation.checkOutDate ? new Date(reservation.checkOutDate).toISOString().split("T")[0] : null;
        this.totalAmount = reservation.totalAmount;
        this.status = reservation.status;
        this.roomName = reservation.room ? reservation.room.name : null;
        this.cats = reservation.cats?.map((cat: any) => cat.name) || [];
        this.caretakers = reservation.caretakers?.map((caretaker: any) => ({
            id: caretaker.id,
            name: caretaker.user.name
        })) || [];
        this.payments = reservation.payments?.map((payment: any) => payment.status) || [];
        this.userName = reservation.user?.name || "Unknown";
    }

    static fromArray(reservations: any[]): ReservationListDTO[] {
        return reservations.map(reservation => new ReservationListDTO(reservation));
    }
}
