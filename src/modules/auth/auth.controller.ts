import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto, } from './dto/signin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Response } from 'express';
import { oauth2Client } from 'src/config/google-auth.config';
import { AuthResponseDto } from './dto/response-auth.dto';
import { CaretakerSignupAuthDto } from './dto/caretaker-signup-auth.dto';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async clientSignUp(@Body() signUpAuthDto: SignupAuthDto) {
    const user = await this.authService.clientSignUp(signUpAuthDto);
    return new AuthResponseDto(user)
  };

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authLogin(@Body() signInAuthDto: SignInAuthDto) {
    const response = await this.authService.signIn(signInAuthDto);
    return {
      success: 'Login successful',
      response
    };
  };

  @Post('caretaker-signup')
  @HttpCode(HttpStatus.CREATED)
  async caretakerSignUp(@Body() caretakerSignUpAuthDto: CaretakerSignupAuthDto) {
    const caretakerUser = await this.authService.caretakerSignUp(caretakerSignUpAuthDto);
    return caretakerUser; 
  };

  @Get('google')
  async redirectToGoogle(@Res() res: Response) {
    const authUrl = await oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
        'https://www.googleapis.com/auth/user.addresses.read'
      ],
    });

    return res.redirect(authUrl);
  };

  @Get('google/callback')
  async handleGoogleCallback(@Query('code') code: string, @Res() res: Response) {
    const { token, user } = await this.authService.googleSignUp(code);

    res.cookie(
      'auth',
      JSON.stringify({ token, user}),
      {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000
      }
    );

    res.redirect(`${process.env.FRONTEND_URL}/loading`);

  };
}

