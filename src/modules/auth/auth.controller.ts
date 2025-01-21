import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto, } from './dto/signin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Response } from 'express';
import { oauth2Client } from 'src/config/google-auth.config';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpAuthDto: SignupAuthDto) {
    const user = await this.authService.signUp(signUpAuthDto);
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

    res.json({ url: authUrl });
  }

  @Get('google/callback')
  async handleGoogleCallback(@Query('code') code: string, @Res() res: Response) {
    const { token, user } = await this.authService.googleSignUp(code);
    console.log('User:', user);
    console.log('Token:', token);

    res.cookie(
      'auth',
      JSON.stringify({ token, user }),
      { httpOnly: true, secure: false }
    );

    res.redirect('http://localhost:3001/dashboard');
  };
}

