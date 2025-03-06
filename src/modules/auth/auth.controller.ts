import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Response } from 'express';
import { oauth2Client } from 'src/config/google-auth.config';
import { SignupResponseDto } from './dto/response-signup.dto';
import { CaretakerSignupAuthDto } from './dto/caretaker-signup-auth.dto';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { Request } from 'express';

dotenv.config();

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async clientSignUp(@Body() signUpAuthDto: SignupAuthDto) {
    const user = await this.authService.clientSignUp(signUpAuthDto);
    return new SignupResponseDto(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authLogin(@Body() signInAuthDto: SignInAuthDto) {
    const response = await this.authService.signIn(signInAuthDto);
    return {
      success: 'Login successful',
      response,
    };
  }

  @Post('caretaker-signup')
  @HttpCode(HttpStatus.CREATED)
  async caretakerSignUp(
    @Body() caretakerSignUpAuthDto: CaretakerSignupAuthDto,
  ) {
    const caretakerUser = await this.authService.caretakerSignUp(
      caretakerSignUpAuthDto,
    );
    return caretakerUser;
  }

  @Get('google')
  async redirectToGoogle(@Res() res: Response) {
    const authUrl = await oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
        'https://www.googleapis.com/auth/user.addresses.read',
      ],
    });

    return res.redirect(authUrl);
  }

  @Get('google/callback')
  async handleGoogleCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    console.log('Received Google callback with code:', code);

    try {
      const { token, user } = await this.authService.googleSignUp(code);
      console.log('Generated token and user:', { token, user });

      res.cookie('auth', JSON.stringify({ token, user }), {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
        sameSite: 'none'
      });

      console.log('res.cookie:', res.cookie);


      console.log(
        'Cookie set, redirecting to:',
        `${process.env.FRONTEND_URL}/loading`,
      );

      res.on('finish', () => {
        console.log('Response headers:', res.getHeaders());
      });

      res.redirect(`${process.env.FRONTEND_URL}/loading`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      throw error;
    }
  };

  @Get('me')
  async getAuthUser(@Req() req: Request) {

    cookieParser()(req, req.res, () => { });

    const authCookie = req.cookies['auth'];

    if (authCookie) {
      try {
        const { token, user } = JSON.parse(authCookie);
        return { token, user };
      } catch (error) {
        console.error('Error parsing cookie:', error);
        return { message: 'Error parsing cookie data' };
      }
    } else {
      return { message: 'No auth cookie found' };
    }
  }
}
