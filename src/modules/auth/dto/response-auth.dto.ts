import { Role } from 'src/enums/roles.enum';
import { Cat } from 'src/modules/cats/entities/cat.entity';

export class AuthResponseDto {
    id: string;
    name: string;
    email: string;
    birthdate: Date;
    phone: string;
    cats: Cat[];
    role: Role;
    deleted_at: Date;

    constructor(
        partial: Partial<AuthResponseDto>,
        includeAdmin: boolean = false,
    ) {
        const {
            id,
            name,
            email,
            birthdate,
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
        this.birthdate = birthdate;
        this.cats = cats;

        if (includeAdmin) {
            this.role = role;
        }
    };
}