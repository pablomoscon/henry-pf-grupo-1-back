import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CredentialsService } from '../credentials/credentials.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly credentialsService: CredentialsService,

    ) {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.REDIRECT_URI,
            scope: ['profile', 'email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ) {
        try {
            const { email, sub: googleId, name } = profile._json;
            let user = await this.usersService.findByEmail(email);

            if (!user) {
                user = await this.usersService.create({
                    email,
                    name,
                });
                await this.credentialsService.createGoogleCredential(
                    { googleId },
                    user,
                );
            }
            const token = await this.authService.createToken(user);

            done(null, { user, token });
        } catch (error) {
            done(error, { message: "Failed to validate Google profile" })
        }
    };
}