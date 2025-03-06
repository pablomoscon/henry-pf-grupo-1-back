import { Role } from 'src/enums/roles.enum';
import { Cat } from 'src/modules/cats/entities/cat.entity';

export class SignupResponseDto {
    id: string;
    name: string;
    email: string;
    address: string;
    customerId: string;
    phone: string;
    cats: Cat[];
    role: Role;
    deleted_at: Date;

    constructor(
        partial: Partial<SignupResponseDto>,
        includeAdmin: boolean = false,
    ) {
        const {
            id,
            name,
            email,
            address,
            customerId,
            phone,
            deleted_at,
            cats,
            role,
        } = partial;
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.deleted_at = deleted_at;
        this.address = address;
        this.customerId = customerId;
        this.cats = cats;

        if (includeAdmin) {
            this.role = role;
        }
    };
}