import { User } from "src/modules/users/entities/user.entity";

export interface GoogleUserInfo {
    sub?: string;
    email?: string;
    name?: string;
}

export interface GoogleSignUpResponse {
    token: string;
    user: User; 
}

export interface UserWithToken {
    user: User;
    token: string;
}