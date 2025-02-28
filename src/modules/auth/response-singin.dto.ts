export class SigninResponseDto {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        phone: string;
        address: string;
        customerId: string;
    };
}